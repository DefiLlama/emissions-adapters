import { manualCliff } from "../adapters/manual";
import { Protocol } from "../types/adapters";
import adapter from "../adapters/curve/curve";
import incentives from "../adapters/curve/community";
import { periodToSeconds } from "../utils/time";

function protocol() {
  const earlyUsers = async () =>
    adapter(
      "0x575CCD8e2D300e2377B43478339E364000318E2c",
      "ethereum",
      0,
      "initial_locked_supply",
    );
  const employees = async () =>
    adapter(
      "0x679FCB9b33Fc4AE10Ff4f96caeF49c1ae3F8fA67",
      "ethereum",
      26666666,
      "initial_locked_supply",
    );
  const teamAndInvestors = async () =>
    Promise.all(
      [
        ["0xf7dbc322d72c1788a1e37eee738e2ea9c7fa875e", 14016820],
        ["0xd2D43555134dC575BF7279F4bA18809645dB0F1D", 0],
        ["0x2a7d59e327759acd5d11a8fb652bf4072d28ac04", 0],
      ].map((c: any[]) =>
        adapter(c[0], "ethereum", c[1], "initial_locked_supply"),
      ),
    );
  const community = async () =>
    incentives(
      "0xd533a949740bb3306d119cc777fa900ba034cd52",
      1597266000,
      274815283,
      2 ** 0.25,
      periodToSeconds.year,
    );
  return {
    "community reserve": manualCliff(1597285800, 151515151),
    "early users": earlyUsers,
    employees,
    "team and investors": teamAndInvestors,
    community,
    meta: {
      sources: [
        "https://etherscan.io/tx/0x3f9aa0ff15fbd00cce60e36f32f25d6f85a43a19d983100d98007a84609f861a",
        "https://curve.readthedocs.io/dao-gauges.html",
      ],
      token: "ethereum:0xd533a949740bb3306d119cc777fa900ba034cd52",
      protocolIds: ["3"],
    },
    categories: {
      noncirculating: ["community reserve"],
      insiders: ["team and investors", "employees"],
      farming: ["community", "early users"],
    },
  };
}
const curve: Protocol = protocol();
export default curve;
