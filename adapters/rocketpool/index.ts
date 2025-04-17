import { call } from "@defillama/sdk/build/abi/abi2";
import adapter from "./emissions";
import abi from "./abi";

const RPL_TOKEN = "0xD33526068D116cE69F19A9ee46F0bd304F21A51f";
const ROCKET_STORAGE = "0x1d8f8f00cfa6758d7be78336684788fb0ee0fa46";

const INFLATION_SETTINGS_KEY = "0x36b7eef85823b64ca08056c771cf2b8dd4f9f4491b3adfa282c1d3dd7b847af8";
const REWARDS_SETTINGS_KEY = "0x3ad4f859a8131d0f6f1460405f2f1ae75831e5545f71f91a5125524636e35e53";

export const rocketPoolEmissions = async () => {
    // Fetch current contract addresses
    const [inflationSettings, rewardsSettings] = await Promise.all([
        call({
            target: ROCKET_STORAGE,
            abi: abi.getAddress,
            params: [INFLATION_SETTINGS_KEY],
            chain: "ethereum"
        }),
        call({
            target: ROCKET_STORAGE,
            abi: abi.getAddress,
            params: [REWARDS_SETTINGS_KEY],
            chain: "ethereum"
        })
    ]);

    // Call adapter with fetched addresses
    return adapter(RPL_TOKEN, inflationSettings, rewardsSettings, "ethereum")();
};
