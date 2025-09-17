import { CliffAdapterResult } from "../../types/adapters";

type UnlockScheduleEntry = {
  ts: number;
  value: string;
}

type LabelStats = {
  tokensLocked: string;
  tokensDeposited: string;
  tokensUnlocked: string;
  total: number;
  scheduled: number;
  completed: number;
  paused: number;
  canceled: number;
  active: number;
  unlockSchedule: UnlockScheduleEntry[];
}

type StreamflowStats = {
  byLabel: {
    [labelName: string]: LabelStats;
  };
}

type TokenInfo = {
  decimals: number;
}

type StreamflowAPIResponse = {
  stats: StreamflowStats;
  info: TokenInfo;
  defaultLabel: string;
}

export async function fetchStreamStats(mint: string): Promise<StreamflowAPIResponse> {
  return await fetch(`https://api.streamflow.finance/v2/api/token-dashboards/SOLANA/${mint}`).then(r => r.json());
}

export async function processUnlockSchedules(mint: string): Promise<{ [labelName: string]: CliffAdapterResult[] }> {
  const data = await fetchStreamStats(mint);
  const result: { [labelName: string]: CliffAdapterResult[] } = {};
  const tokenDecimals = data.info.decimals;

  Object.entries(data.stats.byLabel).filter(([labelName]) => labelName !== data.defaultLabel).forEach(([labelName, labelStats]) => {
    const unlockSchedule = labelStats.unlockSchedule;
    
    if (unlockSchedule.length === 0) {
      result[labelName] = [];
      return;
    }
    
    let previousValue = 0;
    const sections: CliffAdapterResult[] = [];
    
    unlockSchedule.forEach((entry) => {
      const currentValue = parseFloat(entry.value) / 10 ** tokenDecimals;
      const unlockAmount = currentValue - previousValue;
      
      if (unlockAmount > 0) {
        sections.push({
          type: "cliff",
          start: entry.ts,
          amount: unlockAmount,
        });
      }
      
      previousValue = currentValue;
    });

    result[labelName] = sections;
  });

  return result;
}
