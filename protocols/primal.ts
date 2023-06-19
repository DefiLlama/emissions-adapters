import { daoMakerApi } from "../adapters/daomaker/daomaker";
import { Protocol } from "../types/adapters";

export default async function primal(): Promise<Protocol> {
  return await daoMakerApi("primal");
}
