import * as functions from "firebase-functions";
import * as logger from "firebase-functions/logger";
import { Storage } from "@google-cloud/storage";
import { onCall } from "firebase-functions/v2/https";
import {
  createUserQuery,
  createVideo,
  getVideoQuery,
  getVideosQuery,
} from "./db/queries";

const supportedFormats = [
  "mp4",
  "avi",
  "mov",
  "mkv",
  "wmv",
  "flv",
  "webm",
  "mpeg",
  "mts",
  "3gp",
];

const storage = new Storage();
const rawVideoBucketName = "yt-raw-videos-3463";

const region = "australia-southeast1";

const v2FunctionsOptions = {
  maxInstances: 1,
  region: region,
};

export const createUser = functions
  .region(region)
  .auth.user()
  .onCreate(async (user) => {
    if (!user.email) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Request does not contain user email"
      );
    }
    if (!user.photoURL) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Request does not contain user photo url"
      );
    }

    await createUserQuery(user.uid, user.email, user.photoURL);

    logger.info(`User ${user.email} created`);
  });

export const generateUploadUrl = onCall(v2FunctionsOptions, async (request) => {
  // Check if the user is authentication
  if (!request.auth) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "The function must be called while authenticated."
    );
  }

  const auth = request.auth;
  const data = request.data;

  const title: string = data.title;
  const description: string = data.description;
  const fileExtension: string = data.fileExtension;

  if (title.length < 1) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Title must be at least 1 character long."
    );
  }

  if (title.length > 100) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Title cannot be longer than 100 characters"
    );
  }

  if (description.length < 1) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Description must be at least 1 character long."
    );
  }

  if (description.length > 5000) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Description cannot be longer than 5000 characters"
    );
  }

  if (!supportedFormats.includes(fileExtension)) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      `Unsupported file format. Supported formats: ${supportedFormats.join(
        ", "
      )}`
    );
  }

  // Generate a unique filename for upload
  const videoId = `${auth.uid}-${Date.now()}`;
  const fileName = `${videoId}.${fileExtension}`;
  const bucket = storage.bucket(rawVideoBucketName);

  // Get a v4 signed URL for uploading file
  const [url] = await bucket.file(fileName).getSignedUrl({
    version: "v4",
    action: "write",
    expires: Date.now() + 15 * 60 * 1000, // 15 minutes
  });

  await createVideo(videoId, title, description, fileExtension, auth.uid);

  return { url, fileName };
});

export const getVideos = onCall(v2FunctionsOptions, async () => {
  const videos = await getVideosQuery();

  return videos;
});

export const getVideo = onCall(v2FunctionsOptions, async (request) => {
  const id = request.data.id;

  const video = await getVideoQuery(id);

  return video;
});
