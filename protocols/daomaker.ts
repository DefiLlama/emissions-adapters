import fetch from "node-fetch";
import singleDao, { DaoMakerApiRes } from "../adapters/daomaker/daomaker";
import { Protocol } from "../types/adapters";

export default async function daoMaker(): Promise<Protocol[]> {
  const res: DaoMakerApiRes[] = await fetch(
    `https://api.daomaker.com/defillama/company/vestings`,
  ).then((r) => r.json());

  const protocols: Protocol[] = [];

  await Promise.all(
    res.map((api: DaoMakerApiRes) =>
      singleDao(api)
        .then((r: Protocol) => protocols.push(r))
        .catch((e: Error) =>
          console.error(`${api.title} failed with: \n ${e} \n`),
        ),
    ),
  );

  return protocols;
}
