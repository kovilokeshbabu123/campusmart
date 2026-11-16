import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Download,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { CinematicAudioEngine } from '../video/audioEngine';
import { LoadedBrandImages, drawCommercialFrame } from '../video/canvasRenderer';
import {
  BRAND_ASSETS,
  SCENES,
  SceneDefinition,
  TOTAL_DURATION,
  formatTimecode,
  getSceneAtTime,
} from '../video/timeline';

export type ExportQuality = '1080p' | '4k';

interface VideoStageProps {
  currentTime: number;
  isPlaying: boolean;
  onTimeChange: (timeSec: number) => void;
  onPlayChange: (playing: boolean) => void;
  exportTriggerNonce: number;
}

export function VideoStage({
  currentTime,
  isPlaying,
  onTimeChange,
  onPlayChange,
  exportTriggerNonce,
}: VideoStageProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioRef = useRef<CinematicAudioEngine | null>(null);
  const imagesRef = useRef<LoadedBrandImages>({
    campusPhoto: null,
    officialEmblem: null,
    officialBranding: null,
  });

  const timeRef = useRef(currentTime);
  const playingRef = useRef(isPlaying);
  const lastFrameTsRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const exportCancelRef = useRef(false);

  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [exportQuality, setExportQuality] = useState<ExportQuality>('1080p');
  const [exportProgress, setExportProgress] = useState<number | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  timeRef.current = currentTime;
  playingRef.current = isPlaying;

  // Load official reference images once
  useEffect(() => {
    let cancelled = false;
    const loadImg = (src: string): Promise<HTMLImageElement | null> =>
      new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = src;
      });

    Promise.all([
      loadImg(BRAND_ASSETS.campusPhoto),
      loadImg(BRAND_ASSETS.officialEmblem),
      loadImg(BRAND_ASSETS.officialBranding),
    ]).then(([campusPhoto, officialEmblem, officialBranding]) => {
      if (cancelled) return;
      imagesRef.current = { campusPhoto, officialEmblem, officialBranding };
      setAssetsLoaded(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // Initialize audio engine lazily
  const getAudioEngine = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new CinematicAudioEngine();
    }
    return audioRef.current;
  }, []);

  // Render single frame whenever time or assets change
  const renderNow = useCallback((t: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    drawCommercialFrame(ctx, canvas.width, canvas.height, t, imagesRef.current);
  }, []);

  useEffect(() => {
    if (assetsLoaded) {
      renderNow(currentTime);
    }
  }, [assetsLoaded, currentTime, renderNow]);

  // Playback loop (only runs while playing)
  useEffect(() => {
    if (!isPlaying) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      lastFrameTsRef.current = null;
      audioRef.current?.stop();
      return;
    }

    const audio = getAudioEngine();
    audio.setMuted(isMuted);
    if (!isMuted) {
      audio.start();
    }

    const tick = (now: number) => {
      if (!playingRef.current) return;
      if (lastFrameTsRef.current === null) {
        lastFrameTsRef.current = now;
      }
      const dt = Math.min(0.1, (now - lastFrameTsRef.current) / 1000);
      lastFrameTsRef.current = now;

      const nextTime = timeRef.current + dt;
      if (nextTime >= TOTAL_DURATION) {
        timeRef.current = TOTAL_DURATION;
        onTimeChange(TOTAL_DURATION);
        renderNow(TOTAL_DURATION);
        onPlayChange(false);
        audio.stop();
        return;
      }

      timeRef.current = nextTime;
      onTimeChange(nextTime);
      renderNow(nextTime);
      if (!isMuted) {
        audio.syncScene(nextTime);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      lastFrameTsRef.current = null;
      audio.stop();
    };
  }, [isPlaying, isMuted, getAudioEngine, onPlayChange, onTimeChange, renderNow]);

  // Cleanup download URL
  useEffect(() => {
    return () => {
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
    };
  }, [downloadUrl]);

  // Fullscreen listener
  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const togglePlay = () => {
    if (currentTime >= TOTAL_DURATION - 0.05) {
      onTimeChange(0);
    }
    onPlayChange(!isPlaying);
  };

  const handleRestart = () => {
    onTimeChange(0);
    onPlayChange(true);
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    const audio = getAudioEngine();
    audio.setMuted(nextMuted);
    if (!nextMuted && isPlaying) {
      audio.start();
    } else if (nextMuted) {
      audio.stop();
    }
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen().catch(() => {});
    } else {
      await document.exitFullscreen().catch(() => {});
    }
  };

  const startVideoExport = useCallback(async () => {
    if (exportProgress !== null) return;
    setExportError(null);
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    }

    if (typeof MediaRecorder === 'undefined') {
      setExportError('Video export requires a browser supporting MediaRecorder.');
      return;
    }

    onPlayChange(false);
    exportCancelRef.current = false;
    setExportProgress(0);

    const exportW = exportQuality === '4k' ? 3840 : 1920;
    const exportH = exportQuality === '4k' ? 2160 : 1080;

    const offscreen = document.createElement('canvas');
    offscreen.width = exportW;
    offscreen.height = exportH;
    const offCtx = offscreen.getContext('2d');
    if (!offCtx) {
      setExportError('Unable to initialize export canvas context.');
      setExportProgress(null);
      return;
    }

    const mimeCandidates = [
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm',
    ];
    const mimeType = mimeCandidates.find((m) => MediaRecorder.isTypeSupported(m)) ?? '';

    try {
      const stream = offscreen.captureStream(30);
      const recorder = new MediaRecorder(stream, {
        ...(mimeType ? { mimeType } : {}),
        videoBitsPerSecond: exportQuality === '4k' ? 18_000_000 : 8_000_000,
      });
      mediaRecorderRef.current = recorder;

      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) chunks.push(ev.data);
      };

      const stopped = new Promise<Blob>((resolve) => {
        recorder.onstop = () => {
          resolve(new Blob(chunks, { type: mimeType || 'video/webm' }));
        };
      });

      recorder.start(250);

      // Render 54s at 30fps deterministically (stepped quickly via rAF/timeout)
      const fps = 30;
      const totalFrames = TOTAL_DURATION * fps;
      const frameStepSec = 1 / fps;

      for (let f = 0; f <= totalFrames; f += 1) {
        if (exportCancelRef.current) {
          recorder.stop();
          setExportProgress(null);
          return;
        }
        const t = Math.min(TOTAL_DURATION, f * frameStepSec);
        drawCommercialFrame(offCtx, exportW, exportH, t, imagesRef.current);
        if (f % 15 === 0) {
          setExportProgress(Math.round((f / totalFrames) * 100));
          await new Promise((r) => setTimeout(r, 16));
        }
      }

      recorder.stop();
      const blob = await stopped;
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setExportProgress(null);
    } catch {
      setExportError('Video encoding could not complete in this browser session.');
      setExportProgress(null);
    }
  }, [downloadUrl, exportProgress, exportQuality, onPlayChange]);

  // Allow Top Bar "Export Video" button to trigger export
  const prevTriggerRef = useRef(exportTriggerNonce);
  useEffect(() => {
    if (exportTriggerNonce > prevTriggerRef.current) {
      prevTriggerRef.current = exportTriggerNonce;
      void startVideoExport();
    }
  }, [exportTriggerNonce, startVideoExport]);

  const cancelExport = () => {
    exportCancelRef.current = true;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setExportProgress(null);
  };

  const activeScene: SceneDefinition = getSceneAtTime(currentTime);

  return (
    <div
      ref={containerRef}
      data-testid="video-stage"
      data-active-scene={activeScene.id}
      data-playing={isPlaying ? 'true' : 'false'}
      className="rounded-2xl bg-[#090D0B] border border-slate-200 shadow-lg overflow-hidden"
    >
      {/* 16:9 Cinema Frame */}
      <div className="relative aspect-video w-full bg-[#060A08]">
        <canvas
          ref={canvasRef}
          width={1920}
          height={1080}
          aria-label={`CampusMart Promotional Video — Scene ${activeScene.number}: ${activeScene.title}`}
          className="w-full h-full block object-contain"
        />

        {!assetsLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#060A08]/90 text-white text-sm font-medium">
            Loading official VEMU campus &amp; brand assets...
          </div>
        )}

        {/* Click-to-play overlay when paused at 0s */}
        {assetsLoaded && !isPlaying && currentTime === 0 && exportProgress === null && (
          <button
            type="button"
            onClick={togglePlay}
            aria-label="Play CampusMart Promotional Video"
            className="absolute inset-0 flex items-center justify-center bg-black/25 hover:bg-black/15 transition-colors group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            <span className="flex items-center gap-3 px-6 py-3.5 rounded-full bg-emerald-600 text-white font-display font-semibold text-base shadow-xl group-hover:bg-emerald-500 transition-transform group-hover:scale-105">
              <Play className="w-5 h-5 fill-current" />
              Watch 54s Commercial
            </span>
          </button>
        )}

        {/* Export Progress Overlay */}
        {exportProgress !== null && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/85 text-white px-6 text-center">
            <p className="font-display font-bold text-xl">
              Rendering {exportQuality === '4k' ? '4K UHD (3840×2160)' : '1080p HD (1920×1080)'} Video
            </p>
            <p className="text-sm text-slate-300 mt-1 tabular-nums">
              Encoding 54s commercial frames · {exportProgress}%
            </p>
            <div className="w-72 h-2 bg-slate-800 rounded-full overflow-hidden mt-4">
              <div
                className="h-full bg-emerald-500 transition-all duration-150"
                style={{ width: `${exportProgress}%` }}
              />
            </div>
            <button
              type="button"
              onClick={cancelExport}
              className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-700 text-xs font-medium text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              Cancel Export
            </button>
          </div>
        )}
      </div>

      {/* Transport & Timeline Controls Bar */}
      <div className="bg-[#0E1512] text-slate-100 px-4 py-3.5 border-t border-white/10">
        {/* 7-Scene Segmented Progress Bar + Scrubber */}
        <div className="relative mb-3">
          <div className="grid grid-cols-7 gap-1 h-1.5 mb-1">
            {SCENES.map((scene) => {
              const sceneLen = scene.endSec - scene.startSec;
              const fill = Math.max(
                0,
                Math.min(100, ((currentTime - scene.startSec) / sceneLen) * 100),
              );
              return (
                <button
                  key={scene.id}
                  type="button"
                  onClick={() => onTimeChange(scene.startSec)}
                  title={`Scene ${scene.number}: ${scene.title}`}
                  aria-label={`Jump to Scene ${scene.number}: ${scene.title}`}
                  className="relative h-full bg-white/15 rounded-full overflow-hidden cursor-pointer hover:bg-white/25 transition-colors"
                >
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${fill}%` }}
                  />
                </button>
              );
            })}
          </div>
          <input
            type="range"
            min={0}
            max={TOTAL_DURATION}
            step={0.1}
            value={currentTime}
            aria-label="Commercial timeline scrubber"
            onChange={(e) => onTimeChange(Number(e.target.value))}
            className="cinema-scrubber w-full h-4 block"
          />
        </div>

        {/* Control Buttons Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause video' : 'Play video'}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              {isPlaying ? 'Pause' : 'Play'}
            </button>

            <button
              type="button"
              onClick={handleRestart}
              aria-label="Restart video from Scene 1"
              className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 transition-colors cursor-pointer shrink-0"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={toggleMute}
              aria-label={isMuted ? 'Unmute ambient soundtrack' : 'Mute ambient soundtrack'}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              {isMuted ? 'Sound Off' : 'Sound On'}
            </button>

            <div className="hidden sm:flex items-center gap-2 ml-2 text-xs text-slate-300 font-mono tabular-nums">
              <span>{formatTimecode(currentTime)}</span>
              <span className="text-slate-500">/</span>
              <span className="text-slate-400">{formatTimecode(TOTAL_DURATION)}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden md:inline-block text-xs text-slate-300 truncate max-w-[240px]">
              Scene {activeScene.number} · {activeScene.title}
            </span>

            <div className="flex items-center gap-1 bg-white/10 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setExportQuality('1080p')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  exportQuality === '1080p'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                1080p
              </button>
              <button
                type="button"
                onClick={() => setExportQuality('4k')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  exportQuality === '4k'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                4K
              </button>
            </div>

            <button
              type="button"
              onClick={() => void startVideoExport()}
              disabled={exportProgress !== null}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white text-slate-900 hover:bg-emerald-50 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              Render .WebM
            </button>

            <button
              type="button"
              onClick={() => void toggleFullscreen()}
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 transition-colors cursor-pointer shrink-0"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Inline export download or error notification */}
        {(downloadUrl || exportError) && (
          <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between gap-4 text-xs">
            {downloadUrl ? (
              <>
                <span className="text-emerald-300 font-medium">
                  Render complete ({exportQuality.toUpperCase()} · 54s). Ready to save locally.
                </span>
                <a
                  href={downloadUrl}
                  download={`CampusMart-VEMU-Commercial-${exportQuality}.webm`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-600 text-white font-semibold hover:bg-emerald-500 transition-colors whitespace-nowrap"
                >
                  <Download className="w-3.5 h-3.5" />
                  Save Video File
                </a>
              </>
            ) : (
              <span className="text-rose-300">{exportError}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
