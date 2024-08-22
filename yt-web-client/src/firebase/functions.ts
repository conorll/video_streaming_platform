import { httpsCallable } from "firebase/functions";
import { functions } from "./firebase";

const generateUploadUrlFunction = httpsCallable(functions, "generateUploadUrl");
const getVideosFunction = httpsCallable(functions, "getVideos");
const getVideoFunction = httpsCallable(functions, "getVideo");

export async function uploadVideo(
  file: File,
  title: string,
  description: string
) {
  const response: any = await generateUploadUrlFunction({
    fileExtension: file.name.split(".").pop(),
    title,
    description,
  });

  // Upload the file to the signed URL
  const uploadResult = await fetch(response?.data?.url, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type,
    },
  });

  return uploadResult;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  resolution: number;
  userId: string;
  userEmail: string;
  userPhotoUrl: string;
}

export async function getVideos() {
  const response: any = await getVideosFunction();
  return response.data as Video[];
}

export async function getVideo(id: string) {
  const response: any = await getVideoFunction({ id });
  return response.data as Video;
}
