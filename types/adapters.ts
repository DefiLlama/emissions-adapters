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
};
export type LinearAdapterResult = {
  type: "linear";
  start: number;
  end: number;
  amount: number;
  dateFormat?: string;
};
export type ChartData = {
  timestamps: number[];
  unlocked: number[];
  isContinuous: boolean;
  apiData?: ApiChartData[];
};
export type ApiChartData = {
  timestamp: number;
  unlocked: number;
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
export type Protocol = {
  [section: string]: any;
  documented?: Documented;
  meta: Metadata;
  categories: { [key in SectionType]?: string[] | undefined };
};
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
export type Metadata = {
  sources: string[];
  token: string;
  events?: Event[];
  notes?: string[];
  protocolIds: string[];
  incompleteSections?: IncompleteSection[];
  total?: number
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
};
export type TimeSeriesChainData = {
  [block: string]: {
    timestamp: number;
    result?: any;
  };
};
export type Allocations = { [category: string]: number };

export type EmissionBreakdown = Record<string, { emission24h: number; emission7d: number; emission30d: number }>;
