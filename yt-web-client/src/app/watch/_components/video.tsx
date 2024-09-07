"use client";

import { useEffect, useRef, useState } from "react";

import Linkify from "linkify-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { Video as VideoType } from "@/firebase/functions";

import {
  PlaySVG,
  PauseSVG,
  EnterFullscreenSVG,
  ExitFullscreenSVG,
  EnterTheatreModeSVG,
  ExitTheatreModeSVG,
  MiniplayerSVG,
  VolumeHighSVG,
  VolumeLowSVG,
  VolumeMutedSVG,
  QualitySVG,
} from "./svgs";
import Image from "next/image";

const resolutions = [
  "4320",
  "2160",
  "1440",
  "1080",
  "720",
  "480",
  "360",
  "240",
  "144",
];

const playbackSpeeds = ["0.25", "0.5", "0.75", "1", "1.25", "1.5", "1.75", "2"];

interface VideoProps {
  videoObject: VideoType;
}

const Video: React.FC<VideoProps> = ({ videoObject }) => {
  const videoPrefix =
    "https://storage.googleapis.com/yt-processed-videos-3463/";

  const videoRef = useRef(null);
  const videoContainerRef = useRef(null);
  const volumeSliderRef = useRef(null);
  const overlayRef = useRef(null);

  const timelineRef = useRef(null);

  const [isPaused, setIsPaused] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTheatreMode, setIsTheatreMode] = useState(false);
  const [isInMiniplayer, setIsInMiniplayer] = useState(false);
  const [volume, setVolume] = useState(1);
  const [storedVolume, setStoredVolume] = useState(1);
  const [isQualityDropdownOpen, setIsQualityDropdownOpen] = useState(false);
  const [recentUserInput, setRecentUserInput] = useState(false);

  const [videoDuration, setVideoDuration] = useState<null | string>(null);
  const [videoTime, setVideoTime] = useState("0:00");

  const [playbackSpeed, setPlaybackSpeed] = useState("1");

  const [videoResolution, setVideoResolution] = useState(
    resolutions.find((res) => Number(res) <= videoObject.resolution)
  );

  const togglePlay = () => {
    const video: HTMLVideoElement = videoRef.current!;

    setIsPaused(!video.paused);
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
    showControlsTemporarily();
  };

  const toggleTheatreMode = () => {
    setIsTheatreMode(!isTheatreMode);
  };

  const toggleFullscreen = () => {
    const videoContainer: HTMLDivElement = videoContainerRef.current!;

    setIsFullscreen(!document.fullscreenElement);
    if (!document.fullscreenElement) {
      videoContainer.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    showControlsTemporarily();
  };

  const toggleMiniplayer = () => {
    const video: HTMLVideoElement = videoRef.current!;

    if (!document.pictureInPictureElement) {
      video.requestPictureInPicture();
      setIsInMiniplayer(true);
    } else {
      document.exitPictureInPicture();
      setIsInMiniplayer(false);
    }
  };

  const handleVolumeSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setStoredVolume(vol);
    updateVideoVolume(vol);
  };

  const updateVideoVolume = (vol: number) => {
    const video: HTMLVideoElement = videoRef.current!;
    video.volume = vol;

    setVolume(vol);
    showControlsTemporarily();
  };

  const toggleMute = () => {
    const video: HTMLVideoElement = videoRef.current!;

    if (video.volume === 0) {
      updateVideoVolume(storedVolume);
    } else {
      updateVideoVolume(0);
    }
  };

  const skip = (duration: number) => {
    const video: HTMLVideoElement = videoRef.current!;

    video.currentTime += duration;
    showControlsTemporarily();
  };

  const showControlsTemporarily = () => {
    setRecentUserInput(true);
    startOverlayTimer();
  };

  let overlayTimer: NodeJS.Timeout;

  const startOverlayTimer = () => {
    if (overlayTimer) clearTimeout(overlayTimer);
    overlayTimer = setTimeout(() => {
      setRecentUserInput(false);
    }, 3000); // Hide after 3 seconds
  };

  useEffect(() => {
    const stopShowControlsTemporarily = () => {
      setRecentUserInput(false);
    };

    const videoContainer: HTMLDivElement = videoContainerRef.current!;
    videoContainer.addEventListener("mousemove", showControlsTemporarily);
    videoContainer.addEventListener("mouseleave", stopShowControlsTemporarily);

    return () => {
      videoContainer.removeEventListener("mousemove", showControlsTemporarily);
      videoContainer.removeEventListener(
        "mouseleave",
        stopShowControlsTemporarily
      );
      if (overlayTimer) clearTimeout(overlayTimer);
    };
  }, []);

  const handleKeydown = (e: KeyboardEvent) => {
    const tagName = document?.activeElement?.tagName.toLowerCase();

    if (tagName === "input") return;

    switch (e.key.toLowerCase()) {
      case " ":
        if (tagName === "button") return;
        e.preventDefault();
      case "k":
        togglePlay();
        break;
      case "f":
        toggleFullscreen();
        break;
      case "t":
        toggleTheatreMode();
        break;
      case "i":
        toggleMiniplayer();
        break;
      case "m":
        toggleMute();
        break;
      case "j":
        skip(-10);
        break;
      case "l":
        skip(10);
        break;
      case "arrowleft":
        skip(-5);
        break;
      case "arrowright":
        skip(5);
        break;
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeydown);

    return () => {
      document.removeEventListener("keydown", handleKeydown);
    };
  }, [isTheatreMode]);

  useEffect(() => {
    const video: HTMLVideoElement = videoRef.current!;

    if (!isPaused) {
      video
        .play()
        .catch((error) => console.error("Error attempting to play", error));
    }
  }, [videoResolution]);

  const leadingZeroFormatter = new Intl.NumberFormat(undefined, {
    minimumIntegerDigits: 2,
  });

  const formatDuration = (time: number) => {
    const seconds = Math.floor(time % 60);
    const minutes = Math.floor(time / 60) % 60;
    const hours = Math.floor(time / 3600);

    if (hours === 0) {
      return `${minutes}:${leadingZeroFormatter.format(seconds)}`;
    } else {
      return `${hours}:${leadingZeroFormatter.format(
        minutes
      )}:${leadingZeroFormatter.format(seconds)}`;
    }
  };

  useEffect(() => {
    const video: HTMLVideoElement = videoRef.current!;
    const handleLoadedMetadata = () => {
      setVideoDuration(formatDuration(video.duration));
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);

    // If the metadata is already loaded, set the duration immediately
    if (video.readyState >= 2) {
      handleLoadedMetadata();
    }

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, []);

  useEffect(() => {
    const onTimeUpdate = () => {
      setVideoTime(formatDuration(video.currentTime));
      const percent = video.currentTime / video.duration;
      timeline.style.setProperty("--progress-position", String(percent));
    };

    const video: HTMLVideoElement = videoRef.current!;
    const timeline: HTMLDivElement = timelineRef.current!;
    video.addEventListener("timeupdate", onTimeUpdate);

    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
    };
  }, []);

  const setSpeed = (speed: string) => {
    const video: HTMLVideoElement = videoRef.current!;
    video.playbackRate = Number(speed);
    setPlaybackSpeed(speed);
  };

  useEffect(() => {
    const videoContainer: HTMLDivElement = videoContainerRef.current!;
    const video: HTMLVideoElement = videoRef.current!;

    let isScrubbing = false;
    let wasPaused = false;

    const toggleScrubbing = (e: MouseEvent) => {
      const rect = timeline.getBoundingClientRect();
      const percent =
        Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width;

      isScrubbing = (e.buttons & 1) === 1;
      videoContainer.classList.toggle("scrubbing", isScrubbing);
      if (isScrubbing) {
        wasPaused = video.paused;
        video.pause();
      } else {
        video.currentTime = percent * video.duration;
        if (!wasPaused) video.play();
      }

      onTimelineMouseMove(e);
    };

    const onTimelineMouseMove = (e: MouseEvent) => {
      const rect = timeline.getBoundingClientRect();
      const percent =
        Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width;

      timeline.style.setProperty("--preview-position", String(percent));

      if (isScrubbing) {
        e.preventDefault();
        timeline.style.setProperty("--progress-position", String(percent));
      }
    };

    const timeline: HTMLDivElement = timelineRef.current!;

    timeline.addEventListener("mousemove", onTimelineMouseMove);
    timeline.addEventListener("mousedown", toggleScrubbing);
    document.addEventListener("mouseup", (e) => {
      if (isScrubbing) toggleScrubbing(e);
    });
    document.addEventListener("mousemove", (e) => {
      if (isScrubbing) onTimelineMouseMove(e);
    });
    return () => {
      timeline.removeEventListener("mousemove", onTimelineMouseMove);
      timeline.removeEventListener("mousedown", toggleScrubbing);
    };
  }, []);

  return (
    <main
      className={`mx-auto flex flex-col gap-3 ${
        isTheatreMode ? " pb-8" : "p-8 max-w-screen-lg"
      }`}
    >
      <div
        ref={videoContainerRef}
        className={`relative bg-black flex ${
          isTheatreMode ? "max-h-[80vh]" : ""
        }`}
      >
        <div
          ref={overlayRef}
          className={`flex flex-col absolute w-full h-full z-10 bg-gradient-to-t from-black/50 via-transparent ${
            recentUserInput ||
            isQualityDropdownOpen ||
            isPaused ||
            isInMiniplayer
              ? "opacity-100"
              : " opacity-0"
          } `}
        >
          <div onClick={togglePlay} className="flex-grow"></div>

          <div className="h-[7px] mx-2 flex items-center timeline-container">
            <div
              ref={timelineRef}
              className="bg-neutral-500 h-[3px] flex-grow relative timeline hover:h-full"
            >
              <div className="absolute bg-neutral-200 h-full preview opacity-0"></div>
              <div className=" absolute bg-[rgb(255,0,0)] h-full progress"></div>
              <div className=" absolute bg-[rgb(255,0,0)] h-[200%] aspect-square rounded-full translate-x-[-50%] top-[-50%] thumb opacity-0"></div>
            </div>
          </div>

          <div className="text-white flex justify-between p-1">
            <div className="flex items-center">
              <button onClick={togglePlay}>
                {isPaused ? <PlaySVG /> : <PauseSVG />}
              </button>
              <div className="flex volume-container">
                <button onClick={toggleMute}>
                  {volume === 0 ? (
                    <VolumeMutedSVG />
                  ) : volume < 0.5 ? (
                    <VolumeLowSVG />
                  ) : (
                    <VolumeHighSVG />
                  )}
                </button>
                <input
                  ref={volumeSliderRef}
                  className="w-0 scale-x-0 ease-in-out duration-150 origin-left"
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={handleVolumeSliderChange}
                />
              </div>
              <div className="px-2">
                {videoDuration && videoTime} / {videoDuration}
              </div>
            </div>
            <div className="flex">
              <DropdownMenu
                open={isQualityDropdownOpen}
                onOpenChange={setIsQualityDropdownOpen}
              >
                <DropdownMenuTrigger className="px-0.5">
                  <QualitySVG />
                </DropdownMenuTrigger>
                <DropdownMenuPortal container={videoContainerRef.current}>
                  <DropdownMenuContent side="top" className="w-48">
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        Playback speed
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        <DropdownMenuRadioGroup
                          value={playbackSpeed}
                          onValueChange={(speed) => setSpeed(speed)}
                        >
                          {playbackSpeeds.map((speed) => (
                            <DropdownMenuRadioItem key={speed} value={speed}>
                              {speed === "1" ? "Normal" : speed}
                            </DropdownMenuRadioItem>
                          ))}
                        </DropdownMenuRadioGroup>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>Quality</DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        <DropdownMenuRadioGroup
                          value={videoResolution}
                          onValueChange={setVideoResolution}
                        >
                          {resolutions
                            .filter(
                              (res) => Number(res) <= videoObject.resolution
                            )
                            .map((res) => (
                              <DropdownMenuRadioItem key={res} value={res}>
                                {res}p
                              </DropdownMenuRadioItem>
                            ))}
                        </DropdownMenuRadioGroup>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  </DropdownMenuContent>
                </DropdownMenuPortal>
              </DropdownMenu>
              <button onClick={toggleMiniplayer}>
                <MiniplayerSVG />
              </button>
              <button onClick={toggleTheatreMode}>
                {isTheatreMode ? (
                  <ExitTheatreModeSVG />
                ) : (
                  <EnterTheatreModeSVG />
                )}
              </button>
              <button onClick={toggleFullscreen}>
                {isFullscreen ? <ExitFullscreenSVG /> : <EnterFullscreenSVG />}
              </button>
            </div>
          </div>
        </div>
        <video
          className="w-full aspect-[16/9]"
          controls={false}
          onClick={togglePlay}
          ref={videoRef}
          src={`${videoPrefix}${videoResolution}-${videoObject.id}.${videoObject.fileExtension}`}
          onEnded={() => setIsPaused(true)}
          autoPlay
        />
      </div>
      <div className={`flex flex-col gap-3 ${isTheatreMode ? "px-5" : ""}`}>
        <h1 className="text-xl font-bold break-words">{videoObject.title}</h1>
        <div className="flex items-center gap-3">
          <Image
            className="rounded-full object-cover"
            src={videoObject.userPhotoUrl}
            alt="Video"
            width={40}
            height={40}
          />
          <a className="font-semibold line-clamp-1 break-words">
            {videoObject.userEmail}
          </a>
        </div>
        <Linkify>
          <p className="text-sm bg-zinc-100 p-5 rounded-xl whitespace-pre-wrap description">
            {videoObject.description}
          </p>
        </Linkify>
      </div>
    </main>
  );
};

export default Video;
