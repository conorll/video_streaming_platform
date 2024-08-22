import { setVideoProcessed, setVideoResolution } from "./db/queries";
import {
  convertVideo,
  deleteProcessedVideoFile,
  deleteRawVideoFile,
  deleteThumbnailFile,
  downloadRawVideo,
  generateThumbnail,
  getVideoResolution,
  uploadProcessedVideo,
  uploadThumbnail,
} from "./storage";

const resolutions = [
  "144",
  "240",
  "360",
  "480",
  "720",
  "1080",
  "1440",
  "2160",
  "4320",
];

async function deleteProcessedVideo(
  outputFileName: string,
  videoId: string,
  resolution: string
) {
  try {
    await deleteProcessedVideoFile(outputFileName);
  } catch (error) {
    console.error(
      `Error: failed to delete processed video: ${videoId} in resolution: ${resolution}p`
    );
  }
}

async function deleteThumbnail(thumbnailFileName: string, videoId: string) {
  try {
    await deleteThumbnailFile(thumbnailFileName);
  } catch (error) {
    console.error(`Error: failed to delete thumbnail of video: ${videoId}`);
  }
}

async function deleteRawVideo(inputFileName: string, videoId: string) {
  try {
    await deleteRawVideoFile(inputFileName);
  } catch (error) {
    console.error(`Error: failed to delete raw video: ${videoId}`);
  }
}

export default async function processVideo(inputFileName: string) {
  const videoId = inputFileName.split(".")[0];
  const thumbnailFileName = videoId + ".png";

  try {
    await downloadRawVideo(inputFileName);

    let videoResolution: number;

    videoResolution = await getVideoResolution(inputFileName);

    const applicableResolutions = resolutions.filter(
      (resolution) => Number(resolution) <= videoResolution
    );

    for (const resolution of applicableResolutions) {
      const outputFileName = `${resolution}-${inputFileName}`;

      try {
        await convertVideo(inputFileName, outputFileName, resolution);
        await uploadProcessedVideo(outputFileName);
      } catch (error) {
        await deleteProcessedVideo(outputFileName, videoId, resolution);
        throw error;
      }
      await deleteProcessedVideo(outputFileName, videoId, resolution);
    }

    try {
      await generateThumbnail(inputFileName, thumbnailFileName);
      await uploadThumbnail(thumbnailFileName);
    } catch (error) {
      await deleteThumbnail(thumbnailFileName, videoId);
      throw error;
    }
    await deleteThumbnail(thumbnailFileName, videoId);
    await deleteRawVideo(inputFileName, videoId);

    await setVideoResolution(videoId, videoResolution);
    await setVideoProcessed(videoId);
  } catch (error) {
    await deleteRawVideo(inputFileName, videoId);
    throw error;
  }
}
