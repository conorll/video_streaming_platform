import { updateVideoAfterProcessing } from "./db/queries";
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
  await deleteProcessedVideoFile(outputFileName).catch((error) => {
    console.error(
      `Nonfatal error: failed to delete processed video: ${videoId} in resolution: ${resolution}p`,
      error
    );
  });
}

async function deleteThumbnail(thumbnailFileName: string, videoId: string) {
  await deleteThumbnailFile(thumbnailFileName).catch((error) => {
    console.error(
      `Nonfatal error: failed to delete thumbnail of video: ${videoId}`,
      error
    );
  });
}

async function deleteRawVideo(inputFileName: string, videoId: string) {
  await deleteRawVideoFile(inputFileName).catch((error) => {
    console.error(
      `Nonfatal error: failed to delete raw video: ${videoId}`,
      error
    );
  });
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

    await updateVideoAfterProcessing(videoId, videoResolution);
  } catch (error) {
    await deleteRawVideo(inputFileName, videoId);
    throw error;
  }
}
