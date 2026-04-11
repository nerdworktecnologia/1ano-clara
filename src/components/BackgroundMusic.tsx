import { EVENT_CONFIG } from "@/lib/eventConfig";
import { Lang } from "@/lib/i18n";
import { Volume2, VolumeX } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const STORAGE_KEY = "bg_music_muted";
const TARGET_VOLUME = 0.16;
const TARGET_VOLUME_YT = Math.round(TARGET_VOLUME * 100);

type YouTubePlayer = {
  playVideo: () => void;
  pauseVideo: () => void;
  mute: () => void;
  unMute: () => void;
  setVolume: (v: number) => void;
  getVolume: () => number;
  destroy?: () => void;
};

type YouTubePlayerOptions = {
  width?: string;
  height?: string;
  videoId?: string;
  playerVars?: Record<string, string | number>;
  events?: {
    onReady?: () => void;
  };
};

type YouTubeApi = {
  Player: new (id: string, options: YouTubePlayerOptions) => YouTubePlayer;
};

declare global {
  interface Window {
    YT?: YouTubeApi;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let youtubeApiPromise: Promise<void> | null = null;

function loadYouTubeApi() {
  if (window.YT?.Player) return Promise.resolve();
  if (youtubeApiPromise) return youtubeApiPromise;
  youtubeApiPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
    if (existing) {
      const check = () => (window.YT?.Player ? resolve() : window.setTimeout(check, 50));
      check();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.onerror = () => reject(new Error("Failed to load YouTube API"));
    window.onYouTubeIframeAPIReady = () => resolve();
    document.head.appendChild(script);
  });
  return youtubeApiPromise;
}

function getYouTubeVideoId(url: string) {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") {
      const id = u.pathname.replace("/", "");
      return id || null;
    }
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      return id || null;
    }
    return null;
  } catch {
    return null;
  }
}

function readMuted() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    return raw === "true";
  } catch {
    return false;
  }
}

function writeMuted(muted: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, String(muted));
  } catch {
    return;
  }
}

function fadeTo(audio: HTMLAudioElement, target: number, onDone?: () => void) {
  const step = target > audio.volume ? 0.02 : -0.02;
  const tick = () => {
    const next = Math.max(0, Math.min(1, Number((audio.volume + step).toFixed(2))));
    audio.volume = next;
    const done = (step > 0 && next >= target) || (step < 0 && next <= target);
    if (done) {
      audio.volume = target;
      if (onDone) onDone();
      return;
    }
    window.setTimeout(tick, 30);
  };
  tick();
}

function fadeToYouTube(player: YouTubePlayer, target: number, onDone?: () => void) {
  const current = player.getVolume();
  const step = target > current ? 2 : -2;
  const tick = () => {
    const cur = player.getVolume();
    const next = Math.max(0, Math.min(100, cur + step));
    player.setVolume(next);
    const done = (step > 0 && next >= target) || (step < 0 && next <= target);
    if (done) {
      player.setVolume(target);
      if (onDone) onDone();
      return;
    }
    window.setTimeout(tick, 30);
  };
  tick();
}

interface BackgroundMusicProps {
  lang: Lang;
}

const BackgroundMusic = ({ lang }: BackgroundMusicProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ytContainerIdRef = useRef(`yt-bg-${Math.random().toString(16).slice(2)}`);
  const ytPlayerRef = useRef<YouTubePlayer | null>(null);
  const ytReadyRef = useRef(false);

  const [muted, setMuted] = useState(() => readMuted());
  const [autoMuted, setAutoMuted] = useState(false);
  const [ready, setReady] = useState(false);

  const youtubeUrl = EVENT_CONFIG.backgroundMusicYouTubeUrl;
  const youtubeVideoId = useMemo(() => (youtubeUrl ? getYouTubeVideoId(youtubeUrl) : null), [youtubeUrl]);
  const useYouTube = !!youtubeVideoId;
  const isEffectivelyMuted = muted || autoMuted;

  const labels = useMemo(() => {
    if (lang === "pt") {
      return {
        mute: "Mutar música",
        unmute: "Ativar música",
      };
    }
    return {
      mute: "Mute music",
      unmute: "Turn on music",
    };
  }, [lang]);

  useEffect(() => {
    writeMuted(muted);
  }, [muted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = 0;
  }, []);

  useEffect(() => {
    if (!useYouTube || !youtubeVideoId) return;

    let cancelled = false;
    loadYouTubeApi()
      .then(() => {
        if (cancelled) return;
        const containerId = ytContainerIdRef.current;
        const yt = window.YT;
        if (!yt) return;
        const player = new yt.Player(containerId, {
          width: "0",
          height: "0",
          videoId: youtubeVideoId,
          playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
            playsinline: 1,
            loop: 1,
            playlist: youtubeVideoId,
          },
          events: {
            onReady: () => {
              ytReadyRef.current = true;
              try {
                player.setVolume(0);
                player.mute();
              } catch {
                return;
              }
              if (muted) return;
              try {
                player.playVideo();
                setAutoMuted(true);
                setReady(false);
              } catch {
                return;
              }
            },
          },
        });
        ytPlayerRef.current = player;
      })
      .catch(() => {
        return;
      });

    return () => {
      cancelled = true;
      const player = ytPlayerRef.current;
      ytPlayerRef.current = null;
      ytReadyRef.current = false;
      try {
        player?.destroy?.();
      } catch {
        return;
      }
    };
  }, [muted, useYouTube, youtubeVideoId]);

  useEffect(() => {
    const onFirstGesture = () => {
      if (muted) return;

      if (useYouTube) {
        const player = ytPlayerRef.current;
        if (!player || !ytReadyRef.current) return;
        try {
          player.unMute();
          player.setVolume(0);
          player.playVideo();
          setAutoMuted(false);
          fadeToYouTube(player, TARGET_VOLUME_YT, () => setReady(true));
        } catch {
          return;
        }
        return;
      }

      const audio = audioRef.current;
      if (!audio) return;
      audio.muted = false;
      audio
        .play()
        .then(() => {
          setAutoMuted(false);
          fadeTo(audio, TARGET_VOLUME, () => setReady(true));
        })
        .catch(() => {
          return;
        });
    };
    window.addEventListener("pointerdown", onFirstGesture, { once: true });
    return () => window.removeEventListener("pointerdown", onFirstGesture);
  }, [muted, useYouTube]);

  useEffect(() => {
    if (muted) {
      setAutoMuted(false);
      setReady(false);
      return;
    }

    if (useYouTube) return;
    const audio = audioRef.current;
    if (!audio) return;

    const tryPlayWithSound = () => {
      audio.muted = false;
      audio.volume = 0;
      return audio
        .play()
        .then(() => {
          setAutoMuted(false);
          fadeTo(audio, TARGET_VOLUME, () => setReady(true));
          return true;
        })
        .catch(() => false);
    };

    const tryPlayMuted = () => {
      audio.muted = true;
      audio.volume = 0;
      return audio
        .play()
        .then(() => {
          setAutoMuted(true);
          setReady(false);
          return true;
        })
        .catch(() => false);
    };

    void tryPlayWithSound().then((ok) => {
      if (ok) return;
      void tryPlayMuted();
    });
  }, [muted, useYouTube]);

  const toggle = () => {
    if (useYouTube) {
      const player = ytPlayerRef.current;
      if (isEffectivelyMuted) {
        setMuted(false);
        setAutoMuted(false);
        if (!player || !ytReadyRef.current) return;
        try {
          player.unMute();
          player.setVolume(0);
          player.playVideo();
          fadeToYouTube(player, TARGET_VOLUME_YT, () => setReady(true));
        } catch {
          setReady(false);
        }
        return;
      }

      setMuted(true);
      setAutoMuted(false);
      if (!player || !ytReadyRef.current) {
        setReady(false);
        return;
      }
      fadeToYouTube(player, 0, () => {
        try {
          player.pauseVideo();
          player.mute();
        } catch {
          return;
        }
        setReady(false);
      });
      return;
    }

    const audio = audioRef.current;
    if (!audio) {
      setMuted((m) => !m);
      return;
    }

    if (isEffectivelyMuted) {
      setMuted(false);
      setAutoMuted(false);
      audio.volume = 0;
      audio.muted = false;
      audio
        .play()
        .then(() => {
          fadeTo(audio, TARGET_VOLUME, () => setReady(true));
        })
        .catch(() => {
          setReady(false);
        });
      return;
    }

    setMuted(true);
    setAutoMuted(false);
    fadeTo(audio, 0, () => {
      audio.pause();
      setReady(false);
    });
  };

  return (
    <>
      {useYouTube ? (
        <div
          id={ytContainerIdRef.current}
          style={{
            position: "fixed",
            width: 0,
            height: 0,
            overflow: "hidden",
            left: 0,
            top: 0,
          }}
          aria-hidden="true"
        />
      ) : (
        <audio ref={audioRef} src={EVENT_CONFIG.backgroundMusicSrc} />
      )}
      <button
        type="button"
        onClick={toggle}
        className="fixed top-16 right-4 z-50 flex items-center justify-center bg-card border border-border rounded-full w-11 h-11 shadow-md hover:shadow-lg transition-all font-body text-sm text-foreground"
        aria-label={isEffectivelyMuted ? labels.unmute : labels.mute}
        title={isEffectivelyMuted ? labels.unmute : labels.mute}
      >
        {isEffectivelyMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
      </button>
    </>
  );
};

export default BackgroundMusic;
