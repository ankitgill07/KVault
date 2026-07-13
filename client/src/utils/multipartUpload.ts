import { axiosInstance } from "../api/axoisInstance";

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB minimum part size

interface MultipartUploadOptions {
  file: File;
  uploadType: "preview" | "lecture";
  associatedId: string; // Course ID or Lesson ID
  onProgress?: (progress: number) => void;
  signal?: AbortSignal;
}

export interface UploadResult {
  key: string;
  url?: string;
}

/**
 * Handles S3/R2 Multipart upload with true progress tracking and abort support.
 */
export const uploadLargeFile = async ({
  file,
  uploadType,
  associatedId,
  onProgress,
  signal,
}: MultipartUploadOptions): Promise<UploadResult> => {
  // 1. Initiate Multipart Upload
  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

  const initiateResponse = await axiosInstance.post("/courses/upload/multipart/initiate", {
    fileName: file.name,
    fileType: file.type,
    uploadType,
  });

  const { uploadId, key } = initiateResponse.data.data;
  const totalParts = Math.ceil(file.size / CHUNK_SIZE);
  const partEtags: Array<{ PartNumber: number; ETag: string }> = [];

  // Track progress per part to aggregate them
  const uploadedBytesPerPart: number[] = new Array(totalParts).fill(0);

  const updateProgress = () => {
    if (!onProgress) return;
    const totalUploadedBytes = uploadedBytesPerPart.reduce((acc, bytes) => acc + bytes, 0);
    const progressPercentage = Math.min(
      Math.round((totalUploadedBytes / file.size) * 100),
      99 // Keep at 99% until complete is successful
    );
    onProgress(progressPercentage);
  };

  try {
    // 2. Upload chunks
    for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
      if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

      const start = (partNumber - 1) * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const chunk = file.slice(start, end);

      // Get Presigned Part URL
      const partUrlResponse = await axiosInstance.post("/courses/upload/multipart/part", {
        key,
        uploadId,
        partNumber,
      });

      const { url } = partUrlResponse.data.data;

      // Upload part using XMLHttpRequest to track progress and listen to abort signal
      const etag = await new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", url);

        const abortHandler = () => {
          xhr.abort();
          reject(new DOMException("Aborted", "AbortError"));
        };

        if (signal) {
          if (signal.aborted) {
            reject(new DOMException("Aborted", "AbortError"));
            return;
          }
          signal.addEventListener("abort", abortHandler);
        }

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            uploadedBytesPerPart[partNumber - 1] = event.loaded;
            updateProgress();
          }
        };

        xhr.onload = () => {
          if (signal) signal.removeEventListener("abort", abortHandler);
          if (xhr.status === 200) {
            let eTagHeader = xhr.getResponseHeader("ETag") || xhr.getResponseHeader("etag");
            if (eTagHeader) {
              const cleanEtag = eTagHeader.replace(/"/g, "");
              resolve(cleanEtag);
            } else {
              reject(new Error("ETag header missing in R2 response. Check CORS configuration."));
            }
          } else {
            reject(new Error(`Failed to upload part ${partNumber}. Status: ${xhr.status}`));
          }
        };

        xhr.onerror = () => {
          if (signal) signal.removeEventListener("abort", abortHandler);
          reject(new Error(`Network error during upload of part ${partNumber}`));
        };

        xhr.send(chunk);
      });

      partEtags.push({
        PartNumber: partNumber,
        ETag: etag,
      });
    }

    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

    // 3. Complete Multipart Upload
    const completeResponse = await axiosInstance.post("/courses/upload/multipart/complete", {
      key,
      uploadId,
      parts: partEtags,
      uploadType,
      id: associatedId,
    });

    if (onProgress) {
      onProgress(100);
    }

    return {
      key: completeResponse.data.data.key,
      url: completeResponse.data.data.url,
    };
  } catch (err: any) {
    // If upload was aborted, tell the backend to cleanup
    if (err.name === "AbortError" || signal?.aborted) {
      console.log("[MultipartUpload] Aborting multipart upload on server...");
      await axiosInstance.post("/courses/upload/multipart/abort", {
        key,
        uploadId,
      }).catch(e => console.error("Failed to abort multipart upload on server:", e));
    }
    throw err;
  }
};
