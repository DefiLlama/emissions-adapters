import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import type { Readable } from "stream";

const datasetBucket = "defillama-datasets";

const R2_ENDPOINT = "https://" + process.env.R2_ENDPOINT!;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID!;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!;

const R2 = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});


export async function deleteR2(
  filename: string,
) {
  const command = new DeleteObjectsCommand({
    Bucket: datasetBucket,
    Delete: {
      Objects: [
        {
          Key: filename
        }
      ]
    } 
  })
  return await R2.send(command)
}

export async function storeR2JSONString(filename: string, body: string | Readable, cache?: number) {
  const command = new PutObjectCommand({
    Bucket: datasetBucket,
    Key: filename,
    Body: body,
    ContentType: "application/json",
    ...(!!cache
      ? {
          CacheControl: `max-age=${cache}`,
        }
      : {}),
  });
  return await R2.send(command);
}

export async function getR2JSONString(filename: string) {
  const command = new GetObjectCommand({
    Bucket: datasetBucket,
    Key: filename,
  });
  const data = await R2.send(command);
  return JSON.parse(await data.Body?.transformToString() as string)
}
