import { call, multiCall } from "@defillama/sdk/build/abi/abi2";
import abi from "./abi";
import { findBlockHeightArray } from "../../utils/chainCalls";
import { PromisePool } from "@supercharge/promise-pool";
import { LinearAdapterResult, TimeSeriesChainData } from "../../types/adapters";

interface ExtendedChainData extends TimeSeriesChainData {
    [block: string]: {
        timestamp: number;
        result?: any;
        emissions?: {
            nodeOperator: bigint;
            trustedNode: bigint;
            protocolDAO: bigint;
        };
    };
}

const ONE_ETHER = BigInt("1000000000000000000");
const RPL_TOKEN = "0xD33526068D116cE69F19A9ee46F0bd304F21A51f";
const ROCKET_STORAGE = "0x1d8f8f00cfa6758d7be78336684788fb0ee0fa46";
const INFLATION_SETTINGS_KEY = "0x36b7eef85823b64ca08056c771cf2b8dd4f9f4491b3adfa282c1d3dd7b847af8";
const REWARDS_SETTINGS_KEY = "0x3ad4f859a8131d0f6f1460405f2f1ae75831e5545f71f91a5125524636e35e53";
const TRUSTED_NODE_PERC_KEY = "0xd6887c4e331ade4da631db3936c6e1f4269cddec11d19354bdbdd4ece7a60602";
const PROTOCOL_DAO_PERC_KEY = "0x6678582e322d3bb2828b121b49cedd8feb195f0dd46685b6cb3fb1f72602db7b";
const NODE_OPERATOR_PERC_KEY = "0x9f0d151674c75f531945609603a342ab888005f6a71fa61dc712f810c465a59e";

async function getContractAddresses(block: string) {
    return await multiCall({
        calls: [INFLATION_SETTINGS_KEY, REWARDS_SETTINGS_KEY].map((key) => ({
            target: ROCKET_STORAGE,
            params: [key],
        })),
        abi: abi.getAddress,
        chain: "ethereum",
        block
    });
}

async function getEmissionData(inflationSettings: string, block: string) {
    return await Promise.all([
        call({
            target: inflationSettings,
            abi: abi.getInflationIntervalRate,
            chain: "ethereum",
            block
        }),
        call({
            target: inflationSettings,
            abi: abi.getInflationIntervalStartTime,
            chain: "ethereum",
            block
        }),
        call({
            target: RPL_TOKEN,
            abi: abi.getInflationIntervalTime,
            chain: "ethereum",
            block
        }),
        call({
            target: RPL_TOKEN,
            abi: abi.totalSupply,
            chain: "ethereum",
            block
        }),
        call({
            target: RPL_TOKEN,
            abi: abi.getInflationCalcTime,
            chain: "ethereum",
            block
        }),
    ]);
}

function calculateEmissions(
    currentSupply: string,
    intervalRate: string,
    intervalsPassed: number
) {
    let simulatedSupply = BigInt(currentSupply);
    const initialSupply = simulatedSupply;
    
    for (let i = 0; i < intervalsPassed; i++) {
        simulatedSupply = (simulatedSupply * BigInt(intervalRate)) / ONE_ETHER;
    }
    
    return simulatedSupply - initialSupply;
}

export async function latest(reference: number, backfill: boolean): Promise<number> {
    if (backfill) return reference
    let r;
    try {
        r = await fetch(`https://api.llama.fi/emission/rocket-pool`).then((r) =>
            r.json(),
        );
    } catch {
        return reference;
    }
    if (!r.body) return reference;
    r = JSON.parse(r.body);
    
    if (!r.metadata?.incompleteSections?.[0]?.lastRecord) {
        return reference;
    }
    
    return r.metadata.incompleteSections[0].lastRecord;
}

export async function emission(timestamp: number, backfill: boolean = false, type?: "node" | "trusted" | "protocol") {
    let trackedTimestamp = await latest(timestamp, backfill);
    const chainData: ExtendedChainData = await findBlockHeightArray(trackedTimestamp, "ethereum");
    await PromisePool.withConcurrency(10)
        .for(Object.keys(chainData))
        .process(async (block) => {
            const [inflationSettings] = await getContractAddresses(block);
            const percentages = await multiCall({
                calls: [TRUSTED_NODE_PERC_KEY, PROTOCOL_DAO_PERC_KEY, NODE_OPERATOR_PERC_KEY].map((key) => ({
                    target: ROCKET_STORAGE,
                    params: [key],
                })),
                abi: abi.getUint,
                chain: "ethereum",
                block
            });
            
            const [
                intervalRate, 
                startTime, 
                intervalDuration, 
                currentSupply, 
                lastCalcTime, 
            ] = await getEmissionData(inflationSettings, block);

            const [trustedNodePerc, protocolPerc, nodePerc] = percentages;
            
            const effectiveStartTime = lastCalcTime === "0" ? startTime : lastCalcTime;
            const timeElapsed = chainData[block].timestamp - Number(effectiveStartTime);
            const intervalsPassed = Math.floor(timeElapsed / Number(intervalDuration));
            
            if (intervalsPassed <= 0) {
                chainData[block].emissions = {
                    nodeOperator: BigInt(0),
                    trustedNode: BigInt(0),
                    protocolDAO: BigInt(0)
                };
                return;
            }
            
            const totalPendingEmission = calculateEmissions(
                currentSupply,
                intervalRate,
                intervalsPassed
            );

            chainData[block].emissions = {
                nodeOperator: (totalPendingEmission * BigInt(nodePerc)) / ONE_ETHER,
                trustedNode: (totalPendingEmission * BigInt(trustedNodePerc)) / ONE_ETHER,
                protocolDAO: (totalPendingEmission * BigInt(protocolPerc)) / ONE_ETHER
            };
        });
        
    const blocks = Object.keys(chainData).sort((a, b) => 
        chainData[a].timestamp - chainData[b].timestamp);


    if (blocks.length === 0) {
        return [];
    }

    const sections: LinearAdapterResult[] = [];

    for (let i = 0; i < blocks.length - 1; i++) {
        const currentBlock = blocks[i];
        const nextBlock = blocks[i + 1];
        
        const currentData = chainData[currentBlock];
        const nextData = chainData[nextBlock];
        
        if (!currentData?.emissions || !nextData?.emissions) {
            continue;
        }

        if (currentData.emissions.nodeOperator < 0) {
            currentData.emissions.nodeOperator = BigInt(0);
        }
        if (currentData.emissions.trustedNode < 0) {
            currentData.emissions.trustedNode = BigInt(0);
        }
        if (currentData.emissions.protocolDAO < 0) {
            currentData.emissions.protocolDAO = BigInt(0);
        }

        sections.push(
            {
                type: "linear",
                start: currentData.timestamp,
                end: nextData.timestamp,
                amount: Number(currentData.emissions.nodeOperator) / 1e18,
            },
            {
                type: "linear",
                start: currentData.timestamp,
                end: nextData.timestamp,
                amount: Number(currentData.emissions.trustedNode) / 1e18,
            },
            {
                type: "linear",
                start: currentData.timestamp,
                end: nextData.timestamp,
                amount: Number(currentData.emissions.protocolDAO) / 1e18,
            }
        );
    }
    

    if (type) {
        const startIdx = type === "node" ? 0 : type === "trusted" ? 1 : 2;
        return sections.filter((_, idx) => idx % 3 === startIdx);
    }
    return sections;
}
