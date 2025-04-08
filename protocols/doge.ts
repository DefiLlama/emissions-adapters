import { manualLinear } from "../adapters/manual";
import { LinearAdapterResult, Protocol } from "../types/adapters";

// Block 145000 occurred at UTC: 17.03.2014, 22:17:59
const block145000Timestamp = new Date("2014-03-17T22:17:59Z").getTime() / 1000;
const blockTime = 60;

function getTimestampForBlock(blockNumber: number): number {
    const blockDiff = blockNumber - 145000;
    return block145000Timestamp + (blockDiff * blockTime);
}

interface BlockScheduleEntry {
    startBlock: number;
    endBlock: number;
    maxReward?: number;
    reward?: number;
}

const blockSchedule: BlockScheduleEntry[] = [
    { startBlock: 1, endBlock: 99999, maxReward: 1000000 },
    { startBlock: 100000, endBlock: 144999, maxReward: 500000 },
    { startBlock: 145000, endBlock: 199999, reward: 250000 },
    { startBlock: 200000, endBlock: 299999, reward: 125000 },
    { startBlock: 300000, endBlock: 399999, reward: 62500 },
    { startBlock: 400000, endBlock: 499999, reward: 31250 },
    { startBlock: 500000, endBlock: 599999, reward: 15625 },
    { startBlock: 600000, endBlock: 12500000, reward: 10000 }
];

function rewards(): LinearAdapterResult[] {
    const sections: LinearAdapterResult[] = [];

    for (let i = 0; i < blockSchedule.length; i++) {
        const schedule = blockSchedule[i];
        const startTimestamp = getTimestampForBlock(schedule.startBlock);
        const endTimestamp = getTimestampForBlock(schedule.endBlock);
        
        const blockCount = schedule.endBlock - schedule.startBlock + 1;
        let reward: number;
        if (schedule.reward !== undefined) {
            reward = schedule.reward;
        } else if (schedule.maxReward !== undefined) {
            reward = schedule.maxReward / 2;
        } else {
            throw new Error(`Missing reward info for block range ${schedule.startBlock}-${schedule.endBlock}`);
        }
        const totalEmission = blockCount * reward;
        
        sections.push(manualLinear(
            startTimestamp,
            endTimestamp,
            totalEmission
        ));
    }

    return sections;
}

const doge: Protocol = {
    "Mining rewards": rewards(),
    meta: {
        sources: [
            "https://github.com/dogecoin/dogecoin/blob/master/doc/FAQ.md",
            "https://github.com/dogecoin/dogecoin/blob/master/src/chainparams.cpp",
        ],
        token: "coingecko:dogecoin",
        protocolIds: [],
        notes: [
            "Block rewards were initially random between 0-1,000,000 DOGE for blocks 1-99,999",
            "Block rewards were random between 0-500,000 DOGE for blocks 100,000-144,999",
            "Fixed block rewards were implemented from block 145,000 onwards",
            "Projected until block 12.5M"
        ],
    },
    categories: {
        farming: ["Mining rewards"],
    },
};

export default doge;
