import { Storage } from "@google-cloud/storage";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";

const storage = new Storage();

const rawVideoBucketName = "yt-raw-videos-3463";
const processedVideoBucketName = "yt-processed-videos-3463";
const thumbnailBucketName = "thumbnails-3463";

const localRawVideoPath = "./raw-videos";
const localProcessedVideoPath = "./processed-videos";
const thumbnailPath = "./thumbnails";

export function getVideoResolution(rawVideoName: string): Promise<number> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(`${localRawVideoPath}/${rawVideoName}`, (err, metadata) => {
      if (err) {
        reject(err);
      }

      const videoStream = metadata.streams.find(
        (stream) => stream.codec_type === "video"
      );
      if (videoStream && videoStream.height !== undefined) {
        console.log(
          `Video resolution extracted. Resolution: ${videoStream.height}p`
        );
        resolve(videoStream.height);
      } else {
        reject(
          new Error(`Video stream not found or height information is missing`)
        );
      }
    });
  });
}

/**
 * Creates the local directories for raw and processed videos and thumbnails.
 */
export function setupDirectories() {
  ensureDirectoryExistence(localRawVideoPath);
  ensureDirectoryExistence(localProcessedVideoPath);
  ensureDirectoryExistence(thumbnailPath);
}

/**
 * @param rawVideoName - The name of the file to convert from {@link localRawVideoPath}.
 * @param processedVideoName - The name of the file to convert to {@link localProcessedVideoPath}.
 * @returns A promise that resolves when the video has been converted.
 */
export function convertVideo(
  rawVideoName: string,
  processedVideoName: string,
  resolution: string
) {
  return new Promise<void>((resolve, reject) => {
    ffmpeg(`${localRawVideoPath}/${rawVideoName}`)
      .outputOptions("-vf", `scale=-2:${resolution}`)
      .on("end", function () {
        console.log(`${processedVideoName} processed successfuly`);
        resolve();
      })
      .on("error", function (err: any) {
        reject(err);
      })
      .save(`${localProcessedVideoPath}/${processedVideoName}`);
  });
}

export function generateThumbnail(rawVideoName: string, thumbnailName: string) {
  return new Promise<void>((resolve, reject) => {
    ffmpeg(`${localRawVideoPath}/${rawVideoName}`)
      .screenshots({
        count: 1,
        folder: thumbnailPath,
        filename: thumbnailName,
      })
      .on("end", () => {
        console.log(`Thumbnail created at: ${thumbnailPath}/${thumbnailName}`);
        resolve();
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}

/**
 * @param fileName - The name of the file to download from the
 * {@link rawVideoBucketName} bucket into the {@link localRawVideoPath} folder.
 * @returns A promise that resolves when the file has been downloaded.
 */
export async function downloadRawVideo(fileName: string) {
  await storage
    .bucket(rawVideoBucketName)
    .file(fileName)
    .download({
      destination: `${localRawVideoPath}/${fileName}`,
    });

  console.log(
    `gs://${rawVideoBucketName}/${fileName} downloaded to ${localRawVideoPath}/${fileName}.`
  );
}

/**
 * @param fileName - The name of the file to upload from the
 * {@link localProcessedVideoPath} folder into the {@link processedVideoBucketName}.
 * @returns A promise that resolves when the file has been uploaded.
 */
export async function uploadProcessedVideo(fileName: string) {
  await uploadFile(fileName, localProcessedVideoPath, processedVideoBucketName);
}

export async function uploadThumbnail(fileName: string) {
  await uploadFile(fileName, thumbnailPath, thumbnailBucketName);
}

async function uploadFile(
  fileName: string,
  filePath: string,
  bucketName: string
) {
  const bucket = storage.bucket(bucketName);

  // Upload video to the bucket
  await storage.bucket(bucketName).upload(`${filePath}/${fileName}`, {
    destination: fileName,
  });
  console.log(
    `${filePath}/${fileName} uploaded to gs://${bucketName}/${fileName}.`
  );

  // Set the video to be publicly readable
  await bucket.file(fileName).makePublic();
}

/**
 * @param fileName - The name of the file to delete from the
 * {@link localRawVideoPath} folder.
 * @returns A promise that resolves when the file has been deleted.
 *
 */
export function deleteRawVideoFile(fileName: string) {
  return deleteFile(`${localRawVideoPath}/${fileName}`);
}

/**
 * @param fileName - The name of the file to delete from the
 * {@link localProcessedVideoPath} folder.
 * @returns A promise that resolves when the file has been deleted.
 *
 */
export function deleteProcessedVideoFile(fileName: string) {
  return deleteFile(`${localProcessedVideoPath}/${fileName}`);
}

export function deleteThumbnailFile(fileName: string) {
  return deleteFile(`${thumbnailPath}/${fileName}`);
}

/**
 * @param filePath - The path of the file to delete.
 * @returns A promise that resolves when the file has been deleted.
 */
function deleteFile(filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log(`File deleted at ${filePath}`);
          resolve();
        }
      });
    } else {
      console.log(`File not found at ${filePath}, skipping delete.`);
      resolve();
    }
  });
}

/**
 * Ensures a directory exists, creating it if necessary.
 * @param {string} dirPath - The directory path to check.
 */
function ensureDirectoryExistence(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true }); // recursive: true enables creating nested directories
    console.log(`Directory created at ${dirPath}`);
  }
}
