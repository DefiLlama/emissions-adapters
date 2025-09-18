import { processUnlockSchedules } from "../adapters/streamflow";
import { Protocol } from "../types/adapters";

const STREAM_MINT = "STREAMribRwybYpMmSYoCsQUdr6MZNXEqHgm7p1gu9M";
const CHAIN = "solana";

async function createStreamflowProtocol(): Promise<Protocol> {
  const unlockSchedules = await processUnlockSchedules(STREAM_MINT);

  return {
    ...unlockSchedules,
    meta: {
      sources: [
        "https://app.streamflow.finance/project-dashboard/solana/mainnet/STREAMribRwybYpMmSYoCsQUdr6MZNXEqHgm7p1gu9M",
        "https://docs.streamflow.finance/en/articles/9869372-stream-token",
      ],
      token: `${CHAIN}:${STREAM_MINT}`,
      protocolIds: ["2608"],
      notes: [
        "Token unlock schedule data is fetched from the Streamflow Finance API",
        "Data includes all labels and their respective unlock schedules",
        "Sections are dynamically created based on the labels returned by the API",
      ],
      chain: CHAIN,
    },
    categories:
    {
        insiders:["Contributors"],
        privateSale:["Investors"],
        noncirculating:["Ecosystem"],
    }
  };
}

const streamflow = createStreamflowProtocol;

export default streamflow;
