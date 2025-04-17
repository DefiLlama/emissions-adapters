import adapter from "./masterchef";

const MASTERCHEF_V2 = "0xa5f8C5Dbd5F286960b9d90548680aE5ebFf07652";

export const pancakeRegular = adapter(MASTERCHEF_V2, "bsc", true);
export const pancakeSpecial = adapter(MASTERCHEF_V2, "bsc", false);
