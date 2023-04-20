import { Protocol } from "../types/adapters";
import { manualCliff, manualLinear, manualStep } from "../adapters/manual";
import { periodToSeconds } from "../utils/time";

const qty = 100000000;
const start = 1649545200;
const rhinoFi: Protocol = {
  "NEC holders airdrop": [],
  "Usage airdrop": [],
  "Strategic supporters": [],
  "DeversiFi Labs": [],
  "DeversiFi Labs float": [],
  "DLM & Matched DVF": [],
  "Liquidity mining and Treasury": [],
  sources: ["https://rhino.fi/token/tokenomics/"],
  token: "ethereum:0xdddddd4301a082e62e84e43f474f044423921918",
  notes: [],
  protocolIds: ["151"],
};

export default rhinoFi;
