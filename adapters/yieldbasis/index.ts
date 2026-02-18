import { call } from "@defillama/sdk/build/abi/abi2";
import { LinearAdapterResult } from "../../types/adapters";
import abi from "./abi";

// Contract addresses from https://docs.yieldbasis.com/dev/contract-addresses
export const CONTRACTS = {
  YB_TOKEN: "0x01791F726B4103694969820be083196cC7c045fF",
  TEAM_VESTING: "0x93Eb25E380229bFED6AB4bf843E5f670c12785e3",
  INVESTORS_VESTING: "0x11988547B064CaBF65c431c14Ef1b7435084602e",
  GAUGE_CONTROLLER: "0x1Be14811A3a06F6aF4fA64310a636e1Df04c1c21",
  CLIFF_ESCROW: "0x60043a545E22424E73A2dEbb98f8cd4361fE3DA0",
  VE_YB: "0x8235c179E9e84688FBd8B12295EfC26834dAC211",
};

async function fetchVestingEscrowData(target: string): Promise<LinearAdapterResult> {
  const [startTime, endTime, initialLockedSupply] = await Promise.all([
    call({ target, abi: abi.START_TIME, chain: "ethereum" }),
    call({ target, abi: abi.END_TIME, chain: "ethereum" }),
    call({ target, abi: abi.initial_locked_supply, chain: "ethereum" }),
  ]);

  return {
    type: "linear" as const,
    start: Number(startTime),
    end: Number(endTime),
    amount: Number(initialLockedSupply) / 1e18,
  };
}

export async function teamVesting(): Promise<LinearAdapterResult[]> {
  const result = await fetchVestingEscrowData(CONTRACTS.TEAM_VESTING);
  return [result];
}

export async function investorsVesting(): Promise<LinearAdapterResult[]> {
  const result = await fetchVestingEscrowData(CONTRACTS.INVESTORS_VESTING);
  return [result];
}

export default {
  teamVesting,
  investorsVesting,
  CONTRACTS,
};
