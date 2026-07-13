import {
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2 } from "../../db/r2.js";

const BUCKET_NAME = process.env.R2_BUCKET_NAME || "kvaultcousers";

export interface InitiateUploadResult {
  uploadId: string;
  key: string;
}

/**
 * Initiates a multipart upload in Cloudflare R2.
 */
export const initiateMultipartUpload = async (
  fileName: string,
  contentType: string,
  type: "preview" | "lecture"
): Promise<InitiateUploadResult> => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 10);
  const fileExtension = fileName.split(".").pop();
  const folder = type === "preview" ? "raw-previews" : "raw-lectures";
  const key = `${folder}/${timestamp}-${randomString}.${fileExtension}`;

  const command = new CreateMultipartUploadCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  const response = await r2.send(command);

  if (!response.UploadId) {
    throw new Error("Failed to initiate multipart upload");
  }

  return {
    uploadId: response.UploadId,
    key: key,
  };
};

/**
 * Generates a presigned URL for a specific part of a multipart upload.
 */
export const getPartUploadUrl = async (
  key: string,
  uploadId: string,
  partNumber: number
): Promise<string> => {
  const command = new UploadPartCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    UploadId: uploadId,
    PartNumber: partNumber,
  });

  // Signed URL is valid for 1 hour (3600 seconds)
  const url = await getSignedUrl(r2, command, {
    expiresIn: 3600,
  });

  return url;
};

/**
 * Completes the multipart upload, merging all uploaded parts.
 */
export const completeMultipartUpload = async (
  key: string,
  uploadId: string,
  parts: Array<{ PartNumber: number; ETag: string }>
): Promise<string> => {
  // Sort parts by PartNumber (required by AWS S3 / R2)
  const sortedParts = [...parts].sort((a, b) => a.PartNumber - b.PartNumber);

  const command = new CompleteMultipartUploadCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    UploadId: uploadId,
    MultipartUpload: {
      Parts: sortedParts,
    },
  });

  await r2.send(command);

  return key;
};

/**
 * Aborts a multipart upload in Cloudflare R2, cleaning up any uploaded parts.
 */
export const abortMultipartUpload = async (
  key: string,
  uploadId: string
): Promise<void> => {
  const command = new AbortMultipartUploadCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    UploadId: uploadId,
  });

  await r2.send(command);
};
