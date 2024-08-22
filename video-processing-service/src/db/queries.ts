import { eq } from "drizzle-orm";
import db from "./index";
import { videos } from "./schema";

export async function setVideoProcessed(videoId: string) {
  await db
    .update(videos)
    .set({
      processed: true,
    })
    .where(eq(videos.id, videoId));
  console.log(`Row updated for video: ${videoId}. isProcessed set to true`);
}

export async function setVideoResolution(videoId: string, resolution: number) {
  await db
    .update(videos)
    .set({
      resolution: resolution,
    })
    .where(eq(videos.id, videoId));
  console.log(
    `Row updated for video: ${videoId}. Resolution set to ${resolution}`
  );
}
