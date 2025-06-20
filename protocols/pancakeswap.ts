import { CliffAdapterResult, LinearAdapterResult, Protocol } from "../types/adapters";
import { queryDune } from "../utils/dune";


const emissions = async (): Promise<CliffAdapterResult[]> => {
  const result: CliffAdapterResult[] = [];
  //   const issuanceData = await queryDune("5057582")
  //   if(type == "burn"){
  //     for (let i = 0; i < issuanceData.length - 1; i++) {
  //     result.push({
  //       type: "cliff",
  //       start: issuanceData[i].day,
  //       amount: -issuanceData[i].total_burned,
  //       isUnlock: false
  //     })
  //   }
  //     return result;
  //   }else{
  //   for (let i = 0; i < issuanceData.length - 1; i++) {
  //     result.push({
  //       type: "cliff",
  //       start: issuanceData[i].day,
  //       amount: issuanceData[i].total_minted,
  //       isUnlock: false,
  //     })
  //   }
  //   return result;
  // }

  //get https://burn-stats.pancakeswap.com/data.json
  const issuanceData = await fetch("https://burn-stats.pancakeswap.com/data.json").then(res => res.json());
  const summed = issuanceData["mintTimeSeries"].reduce((acc: any, item: any) => {
    item.timestamp = Math.floor(item.timestamp / 1000);
    acc[item.timestamp] = (acc[item.timestamp] || 0) + item.mint;
    return acc;
  }, {});

  Object.entries(summed).forEach(([timestamp, mint]: [string, any]) => {
    result.push({
      type: "cliff",
      start: parseInt(timestamp),
      amount: mint,
      isUnlock: false,
    });
  });
  return result;
}

const pancakeswap: Protocol = {
  "Emissions": emissions,

  meta: {
    sources: [
      "https://docs.pancakeswap.finance/protocol/cake-tokenomics",
      "https://dune.com/pancakeswap/PancakeSwap-CAKE-Tokenomics",
      "https://bscscan.com/address/0x45c54210128a065de780c4b0df3d16664f7f859e",
      "https://pancakeswap.finance/burn-dashboard"
    ],
    token: `bsc:0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82`,
    protocolIds: ["parent#pancakeswap"],
    notes: [
      "This chart shows only emissions of CAKE token.",
      "CAKE have maximum supply of 450 million tokens.",
    ],
  },
  categories: {
    farming: ["Emissions"],
    noncirculating: ["Special Emissions"]
  },
};

export default pancakeswap;
