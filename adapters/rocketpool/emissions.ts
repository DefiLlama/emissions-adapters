import { call } from "@defillama/sdk/build/abi/abi2";
import { AdapterResult } from "../../types/adapters";
import abi from "./abi";

const ONE_ETHER = BigInt("1000000000000000000"); // 1e18
const ONE_YEAR = 365 * 24 * 60 * 60;

export default function adapter(rplToken: string, inflationSettings: string, rewardsSettings: string, chain: string) {
    return async function calculateEmissions(): Promise<AdapterResult[]> {
        try {
            const [
                intervalRate,
                startTime,
                intervalDuration,
                currentSupply,
                lastCalcTime,
                percentages
            ] = await Promise.all([
                call({
                    target: inflationSettings,
                    abi: abi.getInflationIntervalRate,
                    chain,
                }),
                call({
                    target: inflationSettings,
                    abi: abi.getInflationIntervalStartTime,
                    chain,
                }),
                call({
                    target: rplToken,
                    abi: abi.getInflationIntervalTime,
                    chain,
                }),
                call({
                    target: rplToken,
                    abi: abi.totalSupply,
                    chain,
                }),
                call({
                    target: rplToken,
                    abi: abi.getInflationCalcTime,
                    chain,
                }),
                call({
                    target: rewardsSettings,
                    abi: abi.getRewardsClaimersPerc,
                    chain,
                })
            ]);

            const [trustedNodePerc, protocolPerc, nodePerc] = percentages;
            const now = Math.floor(Date.now() / 1000);
            const effectiveStartTime = lastCalcTime === "0" ? startTime : lastCalcTime;

            if (now <= Number(effectiveStartTime)) {
                return [];
            }

            const timeElapsed = now - Number(effectiveStartTime);
            const intervalsPassed = Math.floor(timeElapsed / Number(intervalDuration));
            
            if (intervalsPassed === 0) {
                return [];
            }

            let simulatedSupply = BigInt(currentSupply);
            const initialSupply = simulatedSupply;

            for (let i = 0; i < intervalsPassed; i++) {
                simulatedSupply = (simulatedSupply * BigInt(intervalRate)) / ONE_ETHER;
            }

            const totalPendingEmission = simulatedSupply - initialSupply;
            const intervalsPerYear = Math.floor(ONE_YEAR / Number(intervalDuration));

            const nodeEmission = (totalPendingEmission * BigInt(nodePerc)) / ONE_ETHER;
            const trustedNodeEmission = (totalPendingEmission * BigInt(trustedNodePerc)) / ONE_ETHER;
            const protocolEmission = (totalPendingEmission * BigInt(protocolPerc)) / ONE_ETHER;

            return [
                {
                    type: "linear",
                    start: now,
                    end: now + ONE_YEAR,
                    amount: Number(nodeEmission) * (intervalsPerYear / intervalsPassed) / 1e18,
                    token: rplToken,
                    receiver: "Node Operators"
                },
                {
                    type: "linear",
                    start: now,
                    end: now + ONE_YEAR,
                    amount: Number(trustedNodeEmission) * (intervalsPerYear / intervalsPassed) / 1e18,
                    token: rplToken,
                    receiver: "Trusted Node Operators"
                },
                {
                    type: "linear",
                    start: now,
                    end: now + ONE_YEAR,
                    amount: Number(protocolEmission) * (intervalsPerYear / intervalsPassed) / 1e18,
                    token: rplToken,
                    receiver: "Protocol DAO"
                }
            ];

        } catch (error) {
            throw new Error(`Failed to fetch RocketPool emissions: ${error}`);
        }
    };
}
