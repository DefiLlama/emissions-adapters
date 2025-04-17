import { call, multiCall } from "@defillama/sdk/build/abi/abi2";
import { AdapterResult } from "../../types/adapters";
import abi, { CONSTANTS } from "./abi";

const BLOCKS_PER_DAY = 28800; // approximate number of blocks per day (assuming 3s block time)
const ONE_YEAR = 365 * 24 * 60 * 60;
const DECIMALS = 18;
const CAKE_TOKEN = "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82";

export default function adapter(target: string, chain: string, isRegular: boolean) {
    return async function calculateEmissions(): Promise<AdapterResult[]> {
        try {
            const poolLength = await call({
                target,
                abi: abi.poolLength,
                chain,
            });

            const [cakeRateToRegularFarm, cakeRateToSpecialFarm, masterPerBlock, ratePrecision, totalAlloc] = await Promise.all([
                call({
                    target,
                    abi: abi.cakeRateToRegularFarm,
                    chain,
                }),
                call({
                    target,
                    abi: abi.cakeRateToSpecialFarm,
                    chain,
                }),
                call({
                    target,
                    abi: abi.MASTERCHEF_CAKE_PER_BLOCK,
                    chain,
                }).catch(() => CONSTANTS.MASTERCHEF_CAKE_PER_BLOCK),
                call({
                    target,
                    abi: abi.CAKE_RATE_TOTAL_PRECISION,
                    chain,
                }).catch(() => CONSTANTS.CAKE_RATE_TOTAL_PRECISION),
                call({
                    target,
                    abi: isRegular ? abi.totalRegularAllocPoint : abi.totalSpecialAllocPoint,
                    chain,
                }),
            ]);

            const netEmissionRate = BigInt(masterPerBlock) * 
                                  BigInt(isRegular ? cakeRateToRegularFarm : cakeRateToSpecialFarm) / 
                                  BigInt(ratePrecision);

            const poolIndexes = Array.from({ length: Number(poolLength) }, (_, i) => i);
            
            const [poolInfos, lpTokens] = await Promise.all([
                multiCall({
                    calls: poolIndexes.map(pid => ({
                        target,
                        params: [pid],
                    })),
                    abi: abi.poolInfo,
                    chain,
                    permitFailure: true,
                }),
                multiCall({
                    calls: poolIndexes.map(pid => ({
                        target,
                        params: [pid],
                    })),
                    abi: abi.lpToken,
                    chain,
                    permitFailure: true,
                }),
            ]);

            const results: AdapterResult[] = [];
            const now = Math.floor(Date.now() / 1000);

            for (let pid = 0; pid < poolLength; pid++) {
                const poolInfo = poolInfos[pid];
                const lpToken = lpTokens[pid];

                if (!poolInfo || !lpToken) continue;
                if (poolInfo.allocPoint === "0") continue;
                if (poolInfo.isRegular !== isRegular) continue;

                if (BigInt(totalAlloc) === BigInt(0)) continue;

                const poolEmissionWei = BigInt(poolInfo.allocPoint) * 
                                      BigInt(BLOCKS_PER_DAY) * 
                                      netEmissionRate / 
                                      BigInt(totalAlloc);

                const dailyEmission = Number(poolEmissionWei) / (10 ** DECIMALS);
                const yearlyEmission = dailyEmission * 365;

                results.push({
                    type: "linear",
                    start: now,
                    end: now + ONE_YEAR,
                    amount: yearlyEmission,
                    receiver: lpToken,
                    token: CAKE_TOKEN
                });
            }

            return results;

        } catch (error) {
            throw new Error(`Failed to fetch PancakeSwap ${isRegular ? "regular" : "special"} emissions: ${error}`);
        }
    };
}
