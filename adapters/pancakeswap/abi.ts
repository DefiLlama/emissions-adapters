const abi = {
    cakeRateToRegularFarm: {
        inputs: [],
        name: "cakeRateToRegularFarm",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function"
    },
    cakeRateToSpecialFarm: {
        inputs: [],
        name: "cakeRateToSpecialFarm",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function"
    },
    MASTERCHEF_CAKE_PER_BLOCK: {
        inputs: [],
        name: "MASTERCHEF_CAKE_PER_BLOCK",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function"
    },
    CAKE_RATE_TOTAL_PRECISION: {
        inputs: [],
        name: "CAKE_RATE_TOTAL_PRECISION",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function"
    },
    poolLength: {
        inputs: [],
        name: "poolLength",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function"
    },
    cakePerBlock: {
        inputs: [{ name: "_isRegular", type: "bool" }],
        name: "cakePerBlock",
        outputs: [{ name: "amount", type: "uint256" }],
        stateMutability: "view",
        type: "function"
    },
    totalRegularAllocPoint: {
        inputs: [],
        name: "totalRegularAllocPoint",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function"
    },
    totalSpecialAllocPoint: {
        inputs: [],
        name: "totalSpecialAllocPoint",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function"
    },
    // Pool info
    poolInfo: {
        inputs: [{ name: "", type: "uint256" }],
        name: "poolInfo",
        outputs: [
            { name: "accCakePerShare", type: "uint256" },
            { name: "lastRewardBlock", type: "uint256" },
            { name: "allocPoint", type: "uint256" },
            { name: "totalBoostedShare", type: "uint256" },
            { name: "isRegular", type: "bool" }
        ],
        stateMutability: "view",
        type: "function"
    },
    lpToken: {
        inputs: [{ name: "", type: "uint256" }],
        name: "lpToken",
        outputs: [{ name: "", type: "address" }],
        stateMutability: "view",
        type: "function"
    }
};

const CONSTANTS = {
    MASTERCHEF_CAKE_PER_BLOCK: "40000000000000000000", // 40 CAKE per block
    CAKE_RATE_TOTAL_PRECISION: "1000000000000"
};

export default abi;
export { CONSTANTS };
