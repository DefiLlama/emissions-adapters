import { balance, latest } from "../adapters/balance";
import { manualCliff } from "../adapters/manual";
import { Protocol } from "../types/adapters";

const start = 1505516400;
const qty = 1e9;
const chain = "ethereum";
const address = "0x514910771AF9Ca656af840dff83E8264EcF986CA";

const chainlink: Protocol = {
  "Node Operators": manualCliff(start, qty * 0.35),
  "Public Token Sale": manualCliff(start, qty * 0.35),
  Company: ()=>balance(
    [
      "0x5A8e77bC30948cc9A51aE4E042d96e145648BB4C",
      "0xe0b66bFc7344a80152BfeC954942E2926A6FcA80",
      "0xa42D0A18B834F52e41bEDdEaA2940165db3DA9a3",
      "0xfB682b0dE4e0093835EA21cfABb5449cA9ac9e5e",
      "0x4a87ecE3eFffCb012fbE491AA028032e07B6F6cF",
      "0xD321948212663366503E8dCCDE39cc8e71C267c0",
      "0x55b0ba1994d68C2AB0C01C3332eC9473de296137",
      "0xD48133C96C5FE8d41D0cbD598F65bf4548941e27",
      "0x9c17f630DBde24eECe8fd248fAA2E51f690FF79B",
      "0x35a5dc3FD1210Fe7173aDD3C01144Cf1693B5E45",
      "0x0DFfD343C2D3460a7EAD2797a687304Beb394ce0",
      "0x76287e0F7b107d1C9f8f01D5aFac314Ea8461a04",
      "0x9BBb46637A1Df7CADec2AFcA19C2920CdDCc8Db8",
      "0x7594Eb0ca0a7f313bEFD59AfE9e95c2201a443e4",
      "0x8652Fb672253607c0061677bDCaFb77a324DE081",
      "0x157235A3cc6011d9C26A010875c2550246aAbcCA",
      "0x959815462EeC5fFf387A2e8a6871d94323D371de",
      "0x276F695b3B2C7f24E7CF5b9d24e416a7f357aDb7",
      "0xb9b012cad0A7C1b10CbE33a1B3F623b06fAD1c7C",
      "0x3264225f2Fd3bb8D5DC50587EA7506aA8638B966",
      "0x57Ec4745258e5A4C73d1A82636dc0FE291e3eE9F",
      "0xa71bbBd288a4e288CfDC08bb2E70DCd74Da4486D",
      "0xEc640A90e9A30072158115B7C0253f2689ee6547",
      "0x2a6AB3B0C96377bd20AE47E50ae426A8546A4Ae9",
      "0x5Eab1966D5F61E52C22D0279F06f175e36A7181E",
      "0x8d34d66bDb2d1d6ACd788A2d73d68e62282332e7",
      "0x37398A324d35c942574650B9eD2987BC640BAD76",
    ],
    address,
    chain,
    "chainlink",
    1656630000,
  ),
  meta: {
    token: `${chain}:${address}`,
    sources: ["https://twitter.com/ChainLinkGod/status/1351578377140879361"],
    protocolIds: ["2623"],
    total: qty,
    incompleteSections: [
      {
        key: "Company",
        lastRecord: () => latest("chainlink", 1656630000),
        allocation: qty * 0.3,
      },
    ],
  },
  categories: {
    insiders: ["Node Operators"],
    publicSale: ["Public Token Sale"],
    noncirculating: ["Company"],
  },
};

export default chainlink;
