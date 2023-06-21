import { manualCliff, manualStep } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import { periodToSeconds } from "../utils/time";

const start = 1636156800;
const qty = 2_000_000_000;

const immutable: Protocol = {
  "ecosystem development": manualStep(
    start,
    periodToSeconds.month,
    48,
    (qty * 0.5174) / 48,
  ),
  "project development": manualStep(
    start + 12 * periodToSeconds.month,
    periodToSeconds.month,
    36,
    (qty * 0.25) / 36,
  ),
  "private sale": manualStep(
    start + 12 * periodToSeconds.month,
    periodToSeconds.month,
    18,
    (qty * 0.1426) / 18,
  ),
  "public sale": manualStep(start, periodToSeconds.month, 6, (qty * 0.05) / 6),
  "foundation reserve": manualCliff(start, qty * 0.04),

  meta: {
    token: "ethereum:0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF",
    sources: [
      "https://www.digitalworldsnfts.com/imx-token",
      "https://assets.website-files.com/646557ee455c3e16e4a9bcb3/646557ee455c3e16e4a9be87_Immutable%20X%20Whitepaper.pdf",
    ],
    protocolIds: ["3139"],
  },
  categories: {
    insiders: ["project development", "private sale"],
    noncirculating: [],
    publicSale: ["public sale"],
  },
};

export default immutable;
