import { getVideos } from "@/firebase/functions";
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Home() {
  const videos = await getVideos();

  const thumbnailPrefix = "https://storage.googleapis.com/thumbnails-3463/";

  return (
    <div className="p-8 gap-8 grid grid-dynamic">
      {videos.map((video) => (
        <div className="flex flex-col items-center" key={video.id}>
          <div>
            <Link href={`/watch?v=${video.id}`}>
              <Image
                className="rounded-xl"
                src={thumbnailPrefix + video.id + ".png"}
                alt="Video"
                width={640}
                height={360}
              />
            </Link>
            <div className="flex p-3 gap-3 items-start">
              <Image
                className="rounded-full object-cover"
                src={video.userPhotoUrl}
                alt="Video"
                width={40}
                height={40}
              />

              <div className="max-w-[292px]">
                <Link
                  className="font-semibold text-sm line-clamp-2 break-words"
                  href={`/watch?v=${video.id}`}
                >
                  {video.title}
                </Link>
                <a className="text-sm line-clamp-1 break-words">
                  {video.userEmail}
                </a>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
