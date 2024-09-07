import Image from "next/image";

export default function Loading() {
  const elements = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <div className="p-8 gap-8 grid grid-dynamic">
      {elements.map((value) => (
        <div className="flex flex-col items-center" key={value}>
          <div>
            <Image
              className="rounded-xl aspect-video"
              alt="Video"
              width={640}
              height={360}
              src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mN8XA8AAksBZG7LpHYAAAAASUVORK5CYII="
            />
            <div className="flex p-3 gap-3 items-start">
              <Image
                className="rounded-full object-cover"
                src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mN8XA8AAksBZG7LpHYAAAAASUVORK5CYII="
                alt="Video"
                width={40}
                height={40}
              />

              <div className="max-w-[292px]">
                <a className="font-semibold text-sm line-clamp-2 break-words">
                  ...
                </a>
                <a className="text-sm line-clamp-1 break-words">...</a>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
