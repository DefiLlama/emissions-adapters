import { Protocol } from "../types/adapters";
import { queryDailyOutflows, queryTransferEvents } from "../utils/queries";
import { readableToSeconds } from "../utils/time";

const token = "0xac0f66379a6d7801d7726d5a943356a172549adb"

async function getOutflows(address: string) {
    const data = await queryDailyOutflows({
      token: token,
      fromAddress: address,
      startDate: "2023-02-01"
    })
    return data.map(d => ({
      type: "cliff" as const,
      start: readableToSeconds(d.date),
      amount: Number(d.amount),
    }))
}

async function getBurns() {
    const data = await queryTransferEvents({
        contractAddress: token, 
        toAddress: "0x000000000000000000000000000000000000dead",
        startDate: "2023-02-01"
    })
    return data.map(d => ({
      type: "cliff" as const,
      start: readableToSeconds(d.date),
      amount: -Number(d.amount) / 1e18,
    }))
}

const geodnet: Protocol = {
    "Mining": () => Promise.all([getOutflows("0x8FB9dd00B9a3D893dA96d444817d0b77330d5478"), getBurns()]).then(r => r.flat()),
    "Ecosystem": () => getOutflows("0x3a6906e4239f9860c81035c54198df58d892653b"),
    "Team": () => getOutflows("0xca3e874bc4e830796d822f529c29df30302324b2"),
    "Investors": () => getOutflows("0x486559899e96981dfe55c4e6ebf5101a76bfadfa"),
    "Vendor / Marketing": () => getOutflows("0x82146cf0f350c241757660fd803c73313b06d75c"),
    "Public Sale": () => getOutflows("0xcecccb3ee2c208fb58a5a02499e97d4bf041ff6f"),
    meta: {
        notes: [
            "All the allocations are tracked onchain",
            "Burns are deducted from the mining allocation"
        ],
        token: "coingecko:geodnet",
        sources: [
            "https://docs.geodnet.com/geod-token/tokenomics"
        ],
        protocolIds: ["4304"],
    },
    categories: {
        insiders: ["Team", "Vendor / Marketing"],
        privateSale: ["Investors"],
        farming: ["Mining", "Ecosystem"],
        publicSale: ["Public Sale"],
    },
};
export default geodnet;
