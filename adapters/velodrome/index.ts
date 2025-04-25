import { getLogs } from "@defillama/sdk/build/util/logs";
import { getProvider } from "@defillama/sdk";
import { LinearAdapterResult, TimeSeriesChainData } from "../../types/adapters";
import { PromisePool } from "@supercharge/promise-pool";
import { getBlock } from "@defillama/sdk/build/computeTVL/blocks";
import { unixTimestampNow } from '../../utils/time';

interface VelodromeChainData extends TimeSeriesChainData {
    [block: string]: {
        timestamp: number;
        emissions?: {
            total: bigint;
            gauge: bigint;
            rebase: bigint;
            team?: bigint;
        };
    };
}

interface VelodromeVersion {
    VELO_TOKEN: string;
    MINTER_ADDRESS: string;
    START: number;
    TEAM_ADDRESSES?: string[];
}

const VERSIONS: Record<string, VelodromeVersion> = {
    v1: {
        VELO_TOKEN: "0x3c8b650257cfb5f272f799f5e2b4e65093a11a05",
        MINTER_ADDRESS: "0x3460dc71a8863710d1c907b8d9d5dbc053a4102d",
        START: 10078756,
        TEAM_ADDRESSES: [
            "0xc0de1436c4e247f8652476a0b9ff55699801e1d0",
            "0xb074ec6c37659525eef2fb44478077901f878012",
            "0x2a8951efcd40529dd6edb3149ccbe4e3ce7d053d"
        ]
    },
    v2: {
        VELO_TOKEN: "0x9560e827af36c94d2ac33a39bce1fe78631088db",
        MINTER_ADDRESS: "0x6dc9E1C04eE59ed3531d73a72256C0da46D10982",
        START: 106199046
    }
};

export type EmissionType = 'total' | 'gauge' | 'rebase' | 'team';

interface CacheData {
    chainData: VelodromeChainData | null;
    currentPromise: Promise<VelodromeChainData> | null;
    lastUpdate: number;
}

const cache: Record<string, CacheData> = {
    v1: { chainData: null, currentPromise: null, lastUpdate: 0 },
    v2: { chainData: null, currentPromise: null, lastUpdate: 0 }
};

const CACHE_DURATION = 5 * 60 * 1000;

async function getCachedChainData(version: 'v1' | 'v2'): Promise<VelodromeChainData> {
    const now = Date.now();
    const versionCache = cache[version];
    
    if (versionCache.currentPromise) return versionCache.currentPromise;
    if (versionCache.chainData && now - versionCache.lastUpdate < CACHE_DURATION) {
        return versionCache.chainData;
    }
    
    versionCache.currentPromise = fetchChainData(version).finally(() => {
        versionCache.lastUpdate = Date.now();
        setTimeout(() => versionCache.currentPromise = null, 1000);
    });

    return versionCache.currentPromise;
}

async function fetchChainData(version: 'v1' | 'v2'): Promise<VelodromeChainData> {
    const chainData: VelodromeChainData = {};
    const versionConfig = VERSIONS[version];
    const toBlock = (await getBlock("optimism", unixTimestampNow())).number;
    const mintEventAbi = version === 'v2' 
        ? "event Mint(address indexed _sender, uint256 _weekly, uint256 _circulating_supply, bool indexed _tail)"
        : "event Mint(address indexed sender, uint256 weekly, uint256 circulating_supply, uint256 circulating_emission)";

    if (version === 'v2') {
        const [mintLogs, tokenMints] = await Promise.all([
            getLogs({
                target: versionConfig.MINTER_ADDRESS,
                eventAbi: mintEventAbi,
                fromBlock: versionConfig.START,
                toBlock,
                chain: "optimism",
                entireLog: true,
                parseLog: true
            }),
            getLogs({
                target: versionConfig.VELO_TOKEN,
                topics: [
                    "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
                    "0x0000000000000000000000000000000000000000000000000000000000000000",
                    "0x0000000000000000000000006dc9e1c04ee59ed3531d73a72256c0da46d10982"
                ],
                fromBlock: versionConfig.START,
                toBlock,
                chain: "optimism",
                entireLog: true
            })
        ]);

        const mintsByTx = new Map();
        tokenMints.forEach(transfer => {
            if (!mintsByTx.has(transfer.transactionHash)) {
                mintsByTx.set(transfer.transactionHash, []);
            }
            mintsByTx.get(transfer.transactionHash).push(BigInt(transfer.data));
        });

        await processBlocks(mintLogs, chainData);

        for (const mintLog of mintLogs) {
            const transfers = mintsByTx.get(mintLog.transactionHash) || [];
            const totalEmission = transfers.reduce((sum: bigint, value: bigint) => sum + value, BigInt(0));
            const gaugeEmission = BigInt(mintLog.parsedLog.args._weekly || mintLog.parsedLog.args.weekly);
            const rebaseEmission = totalEmission - gaugeEmission;

            if (chainData[mintLog.blockNumber]) {
                chainData[mintLog.blockNumber].emissions = {
                    total: totalEmission,
                    gauge: gaugeEmission,
                    rebase: rebaseEmission
                };
            }
        }
    } else {
        const [mintLogs, teamTransfers, rebaseTransfers] = await Promise.all([
            getLogs({
                target: versionConfig.MINTER_ADDRESS,
                eventAbi: mintEventAbi,
                fromBlock: versionConfig.START,
                toBlock,
                chain: "optimism",
                entireLog: true,
                parseLog: true
            }),
            getLogs({
                target: versionConfig.VELO_TOKEN,
                topics: [
                    "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
                    "0x0000000000000000000000003460dc71a8863710d1c907b8d9d5dbc053a4102d",
                    versionConfig.TEAM_ADDRESSES?.map(addr => "0x000000000000000000000000" + addr.slice(2)) as unknown as string //defillama sdk doesn't support this yet but it's working
                ],
                fromBlock: versionConfig.START,
                toBlock,
                chain: "optimism",
                entireLog: true
            }),
            getLogs({
                target: versionConfig.VELO_TOKEN,
                topics: [
                    "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
                    "0x0000000000000000000000003460dc71a8863710d1c907b8d9d5dbc053a4102d",
                    "0x0000000000000000000000005d5bea9f0fc13d967511668a60a3369fd53f784f"
                ],
                fromBlock: versionConfig.START,
                toBlock,
                chain: "optimism",
                entireLog: true
            })
        ]);

        const teamTransfersByTx = groupTransfersByTx(teamTransfers);
        const rebaseTransfersByTx = groupTransfersByTx(rebaseTransfers);

        await processBlocks(mintLogs, chainData);

        for (const mintLog of mintLogs) {
            const teamTransfersForTx = teamTransfersByTx.get(mintLog.transactionHash) || [];
            const rebaseTransfersForTx = rebaseTransfersByTx.get(mintLog.transactionHash) || [];

            const teamEmission = teamTransfersForTx.reduce((sum: bigint, value: bigint) => sum + value, BigInt(0));
            const rebaseEmission = rebaseTransfersForTx.reduce((sum: bigint, value: bigint) => sum + value, BigInt(0));
            const weekly = BigInt(mintLog.parsedLog.args.weekly);

            const totalEmission = weekly + teamEmission + rebaseEmission;

            if (chainData[mintLog.blockNumber]) {
                chainData[mintLog.blockNumber].emissions = {
                    total: totalEmission,
                    gauge: weekly,
                    rebase: rebaseEmission,
                    team: teamEmission
                };
            }
        }
    }

    cache[version].chainData = chainData;
    return chainData;
}

function groupTransfersByTx(transfers: any[]) {
    const transfersByTx = new Map();
    transfers.forEach(transfer => {
        if (!transfersByTx.has(transfer.transactionHash)) {
            transfersByTx.set(transfer.transactionHash, []);
        }
        transfersByTx.get(transfer.transactionHash).push(BigInt(transfer.data));
    });
    return transfersByTx;
}

async function processBlocks(mintLogs: any[], chainData: VelodromeChainData) {
    const blockNumbers = [...new Set(mintLogs.map(log => log.blockNumber))];
    await PromisePool.withConcurrency(10)
        .for(blockNumbers)
        .process(async (blockNum) => {
            const block = await getProvider("optimism").getBlock(blockNum);
            if (block?.timestamp) {
                chainData[blockNum] = {
                    timestamp: block.timestamp,
                };
            }
        });
}

function processChainData(chainData: VelodromeChainData, type: EmissionType = 'total'): LinearAdapterResult[] {
    const blocks = Object.keys(chainData)
        .sort((a, b) => chainData[a].timestamp - chainData[b].timestamp);

    const sections: LinearAdapterResult[] = [];

    for (let i = 0; i < blocks.length - 1; i++) {
        const currentBlock = blocks[i];
        const nextBlock = blocks[i + 1];

        const currentData = chainData[currentBlock];
        const nextData = chainData[nextBlock];

        if (!currentData?.emissions?.[type]) continue;

        const amount = Number(currentData.emissions[type]) / 1e18;
        if (amount < 0) continue;

        sections.push({
            type: "linear",
            start: currentData.timestamp,
            end: nextData.timestamp,
            amount
        });
    }

    return sections;
}

export async function getEmissionsV1(type: EmissionType = 'total'): Promise<LinearAdapterResult[]> {
    return processChainData(await getCachedChainData('v1'), type);
}

export async function getEmissionsV2(type: EmissionType = 'total'): Promise<LinearAdapterResult[]> {
    return processChainData(await getCachedChainData('v2'), type);
}
