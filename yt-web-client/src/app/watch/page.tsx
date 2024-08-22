import { getVideo } from "@/firebase/functions";
import Video from "./_components/video";
import type { Video as VideoType } from "@/firebase/functions";

export default async function Watch({
  searchParams,
}: {
  searchParams: { v: string };
}) {
  const videoId = searchParams.v;
  const videoObject: VideoType = await getVideo(videoId);

  return <Video videoObject={videoObject} />;
}
