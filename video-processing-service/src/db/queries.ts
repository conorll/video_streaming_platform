import { eq } from "drizzle-orm";
import db from "./index";
import { videos } from "./schema";

export async function updateVideoAfterProcessing(
  videoId: string,
  resolution: number
) {
  await db
    .update(videos)
    .set({
      resolution: resolution,
      processed: true,
    })
    .where(eq(videos.id, videoId));
  console.log(
    `Row updated for video: ${videoId}. Resolution set to ${resolution} and processed set to true`
  );
}
