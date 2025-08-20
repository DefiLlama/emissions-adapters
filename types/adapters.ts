export type Exports = {
  timestampFrom: number;
  sources: string[];
  vestingSchedule: Allocation;
  comments: string | undefined;
  cap: number | Function | undefined;
};
export type Contracts = { [tag: string]: string };
export type Allocation = {
  insiders: SubAllocation[];
  community: SubAllocation[];
};

export type SubAllocation = {
  name: string;
  total: number;
  from?: number;
  until?: number;
  schedule: any;
};
export type AdapterResult = {
  type: "cliff" | "linear" | "step";
  start?: number | string;
  end?: number | string;
  amount: number;
  steps?: number;
  cliff?: number;
  stepDuration?: number | string;
  receiver?: string;
  token?: string;
  confirmed?: boolean;
  dateFormat?: string;
};
export type RawResult = {
  timestamp: number;
  change: number;
  continuousEnd: number | undefined;
};
export type StepAdapterResult = {
  start: number;
  stepDuration: number;
  steps: number;
  amount: number;
  type: "step";
  dateFormat?: string;
};
export type CliffAdapterResult = {
  type: "cliff";
  start: number;
  amount: number;
  dateFormat?: string;
  isUnlock?: boolean;
};
export type LinearAdapterResult = {
  type: "linear";
  start: number;
  end: number;
  amount: number;
  dateFormat?: string;
  isUnlock?: boolean;
};
export type ChartData = {
  timestamps: number[];
  unlocked: number[];
  rawEmission: number[];
  burned: number[];
  isContinuous: boolean;
  apiData?: ApiChartData[];
};
export type ApiChartData = {
  timestamp: number;
  unlocked: number;
  rawEmission: number;
  burned: number;
  label?: string;
};
export type TransposedApiChartData = {
  label: string;
  data: any;
};
export type ChartYAxisData = {
  start: number;
  increment: number;
  data: number[];
  end: number;
};
export type ProtocolV1 = {
  [section: string]: any;
  documented?: Documented;
  meta: Metadata;
  categories: { [key in SectionType]?: string[] | undefined };
};

export interface ProtocolV2 extends Record<string, any> {
  meta: MetadataV2;
  categories: Categories;
  documented?: Documented;
}

export type Protocol = ProtocolV1 | ProtocolV2;
export type Documented = {
  replaces: string[];
  [section: string]: any;
};
export type IncompleteSection = {
  key: string;
  allocation: number | undefined;
  lastRecord: any;
};
export type SectionType =
  | "publicSale"
  | "privateSale"
  | "insiders"
  | "airdrop"
  | "farming"
  | "noncirculating"
  | "liquidity";
export type RawSection = {
  section: string;
  results: RawResult[] | RawResult[][];
};
export type ChartConfig = {
  steps: number;
  timestamps: number[];
  unlocked: number[];
  workingQuantity: number;
  workingTimestamp: number;
  roundedStart: number;
  roundedEnd: number;
  apiData: ApiChartData[];
  incompleteSection?: IncompleteSection;
  protocol: string;
};
export type ChartSection = {
  data: ChartData;
  section: string;
};
export type Dataset = {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor: string;
  fill: boolean;
};
export type SectionData = {
  rawSections: RawSection[];
  documented: RawSection[];
  startTime: number;
  endTime: number;
  metadata: Metadata;
  categories: Categories;
};
export type Categories = {
  [category: string]: string[];
};

export interface ChangeHistoryEntry {
  timestamp: number; //unix timestapm
  description: string;
  sections?: string[]; // sections affected by this change
}
export type Metadata = {
  sources: string[];
  token: string;
  events?: Event[];
  unlockEvents?: UnlockEvent[];
  notes?: string[];
  protocolIds: string[];
  incompleteSections?: IncompleteSection[];
  total?: number;
  chain?: string;
  changeHistory?: ChangeHistoryEntry[];
};
export type FuturesData = {
  openInterest: number;
  fundingRate: number;
  success?: boolean;
  ratelimited?: boolean;
};
export type Event = {
  description: string;
  timestamp: number;
  noOfTokens: number[];
  category: string;
  unlockType: "cliff" | "linear";
  rateDurationDays?: number;
};

export type AllocationDetail = {
  recipient: string;
  category: string;
  unlockType: "cliff" | "linear_start" | "linear_rate_change";
  amount?: number;
  previousRatePerWeek?: number;
  newRatePerWeek?: number;
  endTimestamp?: number;
};

export type UnlockEvent = {
  timestamp: number;
  cliffAllocations: AllocationDetail[];
  linearAllocations: AllocationDetail[];
  summary: {
    totalTokensCliff?: number;
    netChangeInWeeklyRate?: number;
    totalNewWeeklyRate?: number;
  };
};

export type TimeSeriesChainData = {
  [block: string]: {
    timestamp: number;
    result?: any;
  };
};
export type Allocations = { [category: string]: number };

export type EmissionBreakdown = Record<
  string,
  { emission24h: number; emission7d: number; emission30d: number }
>;

export interface MetadataV2 extends Metadata {
  version: 2;
}

export interface SectionV2 {
  displayName?: string;
  methodology?: string;
  isIncentive?: boolean;
  isTBD?: boolean;
  protocols?: string[];
  components: ComponentV2[];
}

export interface ComponentV2 {
  id: string;
  name: string;
  methodology?: string;
  isIncentive?: boolean;
  isTBD?: boolean;
  protocols?: string[];
  fetch: (backfill?: boolean) => Promise<AdapterResult[]>;
  metadata?: ComponentMetadata;
}

export interface ComponentMetadata {
  contract?: string;
  eventSignature?: string;
  [key: string]: any;
}

export type SectionV1Function = (
  backfill?: boolean,
) => Promise<AdapterResult[]> | AdapterResult[];
export type SectionV1Array = (SectionV1Function | AdapterResult)[];

export interface ComponentResult {
  component: ComponentV2;
  results: AdapterResult[];
  flags: {
    isIncentive: boolean;
    isTBD: boolean;
    protocols?: string[];
  };
}

export interface ProcessedSectionV2 {
  sectionName: string;
  section: SectionV2;
  components: ComponentResult[];
  aggregatedResults: AdapterResult[];
  hasIncentives: boolean;
  hasTBD: boolean;
}

export interface ProcessedProtocolV2 {
  protocol: ProtocolV2;
  sections: ProcessedSectionV2[];
  supplyMetrics: AdjustedSupplyMetrics;
}

export interface AdjustedSupplyMetrics {
  maxSupply: number;
  adjustedSupply: number;
  tbdAmount: number;
  incentiveAmount: number;
  nonIncentiveAmount: number;
}

export interface ChartDataV2 extends ChartData {
  components?: ComponentChartData[];
  supplyMetrics?: AdjustedSupplyMetrics;
}

export interface ComponentChartData {
  section: string;
  component: string;
  name: string;
  data: ChartData;
  flags: {
    isIncentive: boolean;
    isTBD: boolean;
    protocols?: string[];
  };
  metadata?: {
    methodology?: string;
    [key: string]: any;
  };
}

export function isProtocolV2(protocol: Protocol): protocol is ProtocolV2 {
  return (protocol as any).meta?.version === 2;
}

export function isSectionV2(section: any): section is SectionV2 {
  return (
    section &&
    typeof section === "object" &&
    "components" in section &&
    Array.isArray(section.components)
  );
}
