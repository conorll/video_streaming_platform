import { and, eq } from "drizzle-orm";
import db from "./index";
import { users, videos } from "./schema";

export async function createUserQuery(
  id: string,
  email: string,
  photoUrl: string
) {
  await db.insert(users).values({
    id,
    email,
    photoUrl,
  });
}

export async function createVideo(
  id: string,
  title: string,
  description: string,
  userId: string
) {
  await db.insert(videos).values({
    id,
    title,
    description,
    processed: false,
    userId,
  });
}

export async function getVideosQuery() {
  const videoArray = await db
    .select({
      id: videos.id,
      title: videos.title,
      description: videos.description,
      resolution: videos.resolution,
      userId: users.id,
      userEmail: users.email,
      userPhotoUrl: users.photoUrl,
    })
    .from(videos)
    .innerJoin(users, eq(videos.userId, users.id))
    .where(eq(videos.processed, true));

  return videoArray;
}

export async function getVideoQuery(id: string) {
  const videoArray = await db
    .select({
      id: videos.id,
      title: videos.title,
      description: videos.description,
      resolution: videos.resolution,
      userId: users.id,
      userEmail: users.email,
      userPhotoUrl: users.photoUrl,
    })
    .from(videos)
    .innerJoin(users, eq(videos.userId, users.id))
    .where(and(eq(videos.id, id), eq(videos.processed, true)));

  return videoArray[0];
}
