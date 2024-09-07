import Image from "next/image";

export default function Loading() {
  return (
    <main className="mx-auto flex flex-col gap-3 p-8 max-w-screen-lg">
      <div className={`relative bg-black flex`}>
        <video className="w-full aspect-[16/9]" />
      </div>
      <div className={`flex flex-col gap-3`}>
        <h1 className="text-xl font-bold break-words">...</h1>
        <div className="flex items-center gap-3">
          <Image
            className="rounded-full object-cover"
            src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mN8XA8AAksBZG7LpHYAAAAASUVORK5CYII="
            alt="Video"
            width={40}
            height={40}
          />
          <a className="font-semibold line-clamp-1 break-words">...</a>
        </div>
        <p className="text-sm bg-zinc-100 p-5 rounded-xl whitespace-pre-wrap description">
          ...
        </p>
      </div>
    </main>
  );
}
