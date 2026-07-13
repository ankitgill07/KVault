import { GetObjectCommand, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2 } from "../../db/r2.js";

const BUCKET_NAME = process.env.R2_BUCKET_NAME || "kvaultcousers";

export const r2UploadPresignedUrl = async (fullFileName: string, type: string): Promise<string> => {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fullFileName,
    ContentType: type,
  });

  const url = await getSignedUrl(r2, command, {
    expiresIn: 300,
    signableHeaders: new Set(["content-type"]),
  });

  return url;
};

export const r2GetPreSignedUrl = async ({ key, fileName }: { key: string; fileName: string }): Promise<string> => {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ResponseContentDisposition: `"attachment"; filename="${encodeURIComponent(fileName)}"`,
  });
  const getUrl = await getSignedUrl(r2, command, {
    expiresIn: 3600,
  });
  return getUrl;
};

export interface UploadThumbnailResult {
  url: string;
  key: string;
}

export const uploadThumbnail = async (
  file: Express.Multer.File,
  courseId: string
): Promise<UploadThumbnailResult> => {
  try {
    // Validate file type
    const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new Error("Invalid file type. Only JPG, JPEG, PNG, and WebP files are allowed.");
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error("File size too large. Maximum size is 5MB.");
    }

    // Generate unique file name
    const fileExtension = file.originalname.split(".").pop();
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileName = `thumbnails/course-${courseId}-${timestamp}-${randomString}.${fileExtension}`;

    // Upload to R2
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await r2.send(command);

    // Construct the public URL using R2 bucket configuration
    // R2 public bucket URL format: https://[bucket-name].[r2-dev-domain]/[object-key]
    const r2PublicUrl = process.env.R2_PUBLIC_URL || `https://pub-${process.env.R2_ACCOUNT_ID || "synkdrive"}.r2.dev`;
    const url = `${r2PublicUrl}/${fileName}`;

    return {
      url,
      key: fileName,
    };
  } catch (error) {
    console.error("[uploadThumbnail] Error uploading thumbnail:", error);
    throw new Error("Failed to upload thumbnail: " + (error instanceof Error ? error.message : "Unknown error"));
  }
};

export const deleteThumbnail = async (key: string): Promise<void> => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await r2.send(command);
  } catch (error) {
    console.error("[deleteThumbnail] Error deleting thumbnail:", error);
    throw new Error("Failed to delete thumbnail: " + (error instanceof Error ? error.message : "Unknown error"));
  }
};

// ─── Delete a single file from R2 ────────────────────────────────────────────

export const deleteFileFromR2 = async (key: string): Promise<void> => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });
    await r2.send(command);
    console.log(`[R2] Deleted file: ${key}`);
  } catch (error) {
    console.error(`[R2] Error deleting file ${key}:`, error);
    // Don't throw - deletion failures shouldn't block the operation
  }
};

// ─── Delete all files under a prefix (folder) from R2 ────────────────────────

export const deleteFolderFromR2 = async (prefix: string): Promise<void> => {
  try {
    let continuationToken: string | undefined;
    do {
      const listCommand = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      });
      const listResult = await r2.send(listCommand);

      if (listResult.Contents && listResult.Contents.length > 0) {
        const deleteCommand = new DeleteObjectsCommand({
          Bucket: BUCKET_NAME,
          Delete: {
            Objects: listResult.Contents.map((obj) => ({ Key: obj.Key! })),
            Quiet: true,
          },
        });
        await r2.send(deleteCommand);
        console.log(`[R2] Deleted ${listResult.Contents.length} files under prefix: ${prefix}`);
      }

      continuationToken = listResult.NextContinuationToken;
    } while (continuationToken);
  } catch (error) {
    console.error(`[R2] Error deleting folder ${prefix}:`, error);
  }
};

// ─── Upload a user avatar to R2 ──────────────────────────────────────────────

export const uploadAvatarToR2 = async (
  file: Express.Multer.File,
  userId: string
): Promise<{ url: string; key: string }> => {
  const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw new Error("Invalid file type. Only JPG, JPEG, PNG, and WebP files are allowed.");
  }

  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error("File size too large. Maximum size is 5MB.");
  }

  const fileExtension = file.originalname.split(".").pop();
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const fileName = `avatars/${userId}-${timestamp}-${randomString}.${fileExtension}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  await r2.send(command);

  const r2PublicUrl = process.env.R2_PUBLIC_URL || `https://pub-${process.env.R2_ACCOUNT_ID || "synkdrive"}.r2.dev`;
  const url = `${r2PublicUrl}/${fileName}`;

  return { url, key: fileName };
};
