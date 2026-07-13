import { S3Client } from "@aws-sdk/client-s3";

export const r2 = new S3Client({
  region: "apac",
  endpoint: process.env.R2_ENDPOINT as string,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});