import { useRef, useEffect, useState } from "react";
import ModuleService from "@/services/ModuleService";
import { useNavigate, useParams } from "react-router-dom";
import { Badge } from "./ui/badge";
import { ChevronLeft, Loader2 } from "lucide-react";
import { formatVideoTime } from "@/utils/common-functions";

export default function ModuleDetails() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressTrackRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<number | null>(null);
  const lastSavedPercentRef = useRef<number>(0);
  const initialTimeSetRef = useRef(false);
  const controlsTimeout = useRef<number | null>(null);
  const isSeekingRef = useRef(false);
  const hasFetchedDataRef = useRef(false); // Add this ref to track if data has been fetched
  const navigate = useNavigate();

  const [progress, setProgress] = useState(0);
  const [, setUrl] = useState<string>("");
  const [module, setModule] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [playbackRate, ] = useState(1.0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);

  const { id } = useParams();
  const moduleId = Number(id);
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  // Format time in MM:SS format
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const getModuleVideo = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/module-video/${moduleId}`,
        {
          method: "GET",
          //   headers: {
          // Authorization: `Bearer ${token}`,
          // 'Content-Type': 'application/json', // not needed for GET
          //   },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob(); // get response as blob
      const url = URL.createObjectURL(blob);
      setUrl(url);
    } catch (error) {
      console.log("Error fetching module video:", error);
    }
  };

  // Save progress forward only
  const sendProgress = async (percent: number) => {
    if (percent <= lastSavedPercentRef.current) return;
    try {
      await ModuleService.updateProgress(moduleId, {
        progress: percent,
        user_id: user?.id,
      });
      lastSavedPercentRef.current = percent;
    } catch (err) {
      console.error("❌ Error saving progress:", err);
    }
  };

  // Update progress continuously
  const handleTimeUpdate = () => {
    if (!videoRef.current || isSeekingRef.current) return;

    const current = videoRef.current.currentTime;
    const duration = videoRef.current.duration || 1;
    const percent = (current / duration) * 100;

    setCurrentTime(current);
    setProgress(percent);
    setDuration(duration);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = window.setTimeout(
      () => sendProgress(Math.floor(percent)),
      1000
    );
  };

  const handleEnded = () => {
    setProgress(100);
    sendProgress(100);
    setIsPlaying(false);
  };

  // Toggle play/pause
  const togglePlay = () => {
    if (!videoRef.current) return;

    if (videoRef.current.paused) {
      videoRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.error("Error playing video:", err);
        });
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  // Handle progress bar click
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !progressTrackRef.current) return;

    const progressRect = progressTrackRef.current.getBoundingClientRect();
    const clickPosition = (e.clientX - progressRect.left) / progressRect.width;
    const newTime = Math.max(
      0,
      Math.min(
        clickPosition * videoRef.current.duration,
        videoRef.current.duration
      )
    );

    isSeekingRef.current = true;
    videoRef.current.currentTime = newTime;
    setProgress(clickPosition * 100);
    setCurrentTime(newTime);

    // Save progress immediately after seeking
    const percent = Math.floor(clickPosition * 100);
    const savePercent = Math.max(percent, lastSavedPercentRef.current);
    sendProgress(savePercent);

    // Reset seeking flag after a short delay
    setTimeout(() => {
      isSeekingRef.current = false;
    }, 100);
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts if the video is focused or no input is focused
      if (!videoRef.current || document.activeElement?.tagName === "INPUT")
        return;

      switch (e.key) {
        case " ":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowRight":
          e.preventDefault();
          videoRef.current.currentTime += 5;
          break;
        case "ArrowLeft":
          e.preventDefault();
          videoRef.current.currentTime -= 5;
          break;
        case "ArrowUp":
          e.preventDefault();
          setVolume(Math.min(volume + 0.1, 1));
          break;
        case "ArrowDown":
          e.preventDefault();
          setVolume(Math.max(volume - 0.1, 0));
          break;
        case "f":
          e.preventDefault();
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else if (videoRef.current?.parentElement) {
            videoRef.current.parentElement.requestFullscreen();
          }
          break;
        case "m":
          e.preventDefault();
          setVolume(volume > 0 ? 0 : 0.8);
          break;
        default:
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [volume]);

  // Handle mouse movement for controls visibility
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }
      controlsTimeout.current = window.setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };

    const videoContainer = videoRef.current?.parentElement;
    if (videoContainer) {
      videoContainer.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      if (videoContainer) {
        videoContainer.removeEventListener("mousemove", handleMouseMove);
      }
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }
    };
  }, []);

  // Main data fetching effect - runs only once
  useEffect(() => {
    if (hasFetchedDataRef.current) return; // Prevent multiple executions
    hasFetchedDataRef.current = true;

    const fetchAllData = async () => {
      setLoading(true);

      try {
        // 1️⃣ Fetch module details
        const moduleRes = await ModuleService.getModule(moduleId);
        setModule(moduleRes.data || null);

        // 2️⃣ Fetch saved progress from tracking
        const trackingRes = await ModuleService.getModuleTracking(
          user.id,
          moduleId
        );
        const savedProgress = trackingRes.data?.progress ?? 0;
        lastSavedPercentRef.current = savedProgress;
        setProgress(savedProgress);

        // 3️⃣ Fetch module video
        await getModuleVideo();

        // 4️⃣ Once video is ready, set initial time
        if (videoReady && videoRef.current) {
          videoRef.current.currentTime =
            (savedProgress / 100) * videoRef.current.duration;
          setCurrentTime((savedProgress / 100) * videoRef.current.duration);
          initialTimeSetRef.current = true;
        }
      } catch (err) {
        console.error("Error fetching module data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [moduleId, user.id, videoReady]); // Add proper dependencies

  // Initialize video properties - runs only once
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.playbackRate = playbackRate;
    }
  }, []); // Empty dependency array ensures this runs only once

  // Handle video ready state
  const handleVideoLoaded = () => {
    setVideoReady(true);
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  if (loading)
    return (
      <div className="h-40 flex justify-center items-center">
        <Loader2 className="animate-spin mr-2" /> Loading...
      </div>
    );
  if (!module) return <div className="p-6 text-red-500">Module not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center text-gray-700 hover:text-primary transition-colors font-medium"
            >
              <ChevronLeft className="mr-1 h-5 w-5" />
              Back to Dashboard
            </button>
            <h1 className="ml-4 text-xl font-semibold text-gray-900">
              Module Details
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {module.title}
            </h1>

            {/* Progress indicator */}
            {/* <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
              <div
                className="bg-orange-600 h-2.5 rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div> */}

            {/* Video Player */}
            <div className="relative w-full rounded-xl overflow-hidden shadow-lg bg-black group aspect-video">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                src={`${import.meta.env.VITE_API_URL}/module-video/${moduleId}`}
                onTimeUpdate={handleTimeUpdate}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={handleEnded}
                onClick={togglePlay}
                onLoadedMetadata={handleVideoLoaded}
                onCanPlay={handleVideoLoaded}
              />

              {/* Custom Controls */}
              <div
                className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300 ${
                  showControls ? "opacity-100" : "opacity-0"
                }`}
              >
                {/* Progress Bar */}
                <div
                  ref={progressTrackRef}
                  className="h-2 bg-gray-600 rounded-full mb-3 cursor-pointer"
                  onClick={handleProgressClick}
                >
                  <div
                    className="h-2 bg-orange-500 rounded-full relative"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="w-4 h-4 bg-orange-500 rounded-full absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2"></div>
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={togglePlay}
                      className="text-white p-1 rounded-full hover:bg-white/10 transition-colors"
                    >
                      {isPlaying ? (
                        <svg
                          className="w-6 h-6"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-6 h-6"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>

                    <div className="flex items-center space-x-2">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828a1 1 0 010-1.415z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="w-16 md:w-20 accent-orange-500"
                      />
                    </div>

                    <div className="text-white text-sm">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => {
                        if (document.fullscreenElement) {
                          document.exitFullscreen();
                        } else if (videoRef.current?.parentElement) {
                          videoRef.current.parentElement.requestFullscreen();
                        }
                      }}
                      className="text-white p-1 rounded hover:bg-white/10 transition-colors"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 110-2h4a1 1 0 011 1v4a1 1 0 11-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 9a1 1 0 012 0v1.586l2.293-2.293a1 1 0 011.414 1.414L6.414 15H8a1 1 0 110 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 110-2h1.586l-2.293-2.293a1 1 0 011.414-1.414L15 13.586V12a1 1 0 011-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Play/Pause overlay button */}
              {!showControls && (
                <button
                  onClick={togglePlay}
                  className="absolute inset-0 w-full h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20"
                >
                  {!isPlaying && (
                    <svg
                      className="w-16 h-16 text-white/70"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              )}
            </div>

            <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-900">
                About this Module
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {module.description}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Progress Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                Your Progress
              </h3>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Completed
                </span>
                <span className="text-sm font-bold text-primary">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-primary h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                {progress < 100
                  ? "Continue watching to complete this module"
                  : "Module completed! Great job!"}
              </div>
            </div>

            {module.skill_details?.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">
                  Skills Covered
                </h3>
                <div className="flex flex-wrap gap-2">
                  {module.skill_details.map((skill: any, i: number) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-800 hover:bg-blue-200"
                    >
                      {skill.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                Module Details
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium">
                    {formatVideoTime(module.video_time) || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created</span>
                  <span className="font-medium">
                    {module.created_at
                      ? new Date(module.created_at).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated</span>
                  <span className="font-medium">
                    {module.updated_at
                      ? new Date(module.updated_at).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
