type chainContracts = {
  owners: string[];
  token: string;
  timestamp: number;
};
const contracts: { [chain: string]: chainContracts } = {
  ethereum: {
    timestamp: 1651356000,
    owners: [
      "0xcf7b521dc1a0c9c52f5455ec44f64da3555ab9f0",
      "0x54716b0e8263e6797cfc3fe075fe347256c9411c",
      "0x8c417caecd9371d122c5b7eb38e642405c397fc8",
      "0x5d82be8081c1eebb14d7d051b22546ef216d6719",
      "0x54426ee68cdf8f6d76c5f456b8ac3c221a6053cf",
      "0x88a9e5319bb7f8c445c9cc8cfab7734c78f9b1f3",
      "0x96eac357346aabe9af0e9ca6c9d1d8d2464f2cf0",
      "0xf0d9fce0fc5211b3dbf51a054ad38e881cdf72cb",
      "0x3b02d7e4ef64ce583473a92a2277a4a28682ef5f",
      "0xf393eae178fe233c42e3882bab1e1c5e0e2a334e",
      "0xa0ad30961202b5f185a5ef6bb5bee9e865a256df",
      "0x7bff857242164e9d65a6ceee5c7695c8fd8413bf",
      "0x1f389801c2aeab36cddf8772e2a3bb0e60f27bd8",
      "0xe3d194c60d5a64b8dd9bd70fd23f8247d3cba0af",
      "0xd565094564d0c841f5bce2c48597267b7dbdd3ac",
      "0x3813bbc4414e75d66e9e4c6902b184b4cba87a05",
      "0x5fd8e9a538eb3da7f8a8139609fb988809acaf33",
      "0x6f6ca2ffc1d616d4093e849475a4ff880108af78",
      "0x6e3aa80383da31e50b36f999db0b1359d9c9be3f",
      "0xfbe4aadff9a7437c4a6bf865f681432b808980eb",
      "0x8f1454885e548f6f1305474a8b90d8784d0dd70f",
      "0x6380cb41a85f0cf704961e24a570af7f8381e5f1",
    ],
    token: "0x41545f8b9472d758bb669ed8eaeeecd7a9c4ec29",
  },
  polygon: {
    timestamp: 1646524800,
    owners: ["0xc99884be6eee5533be08152c40df0464b3fae877"],
    token: "0x9ff62d1FC52A907B6DCbA8077c2DDCA6E6a9d3e1",
  },
};
export default contracts;
