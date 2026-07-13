import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

export const getVideoDurationInSeconds = async (
  filePath: string,
): Promise<number> => {
  try {
    const { stdout } = await execFileAsync("ffprobe", [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "default=noprint_wrappers=1:nokey=1",
      filePath,
    ]);

    const duration = Number.parseFloat(stdout.trim());
    return Number.isFinite(duration) ? duration : 0;
  } catch (error) {
    console.error(
      "[getVideoDurationInSeconds] Failed to read video duration:",
      error,
    );
    return 0;
  }
};
