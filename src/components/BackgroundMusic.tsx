import { EVENT_CONFIG } from "@/lib/eventConfig";
import { Lang } from "@/lib/i18n";
import { Volume2, VolumeX } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const STORAGE_KEY = "bg_music_muted";
const TARGET_VOLUME = 0.16;

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

interface BackgroundMusicProps {
  lang: Lang;
}

const BackgroundMusic = ({ lang }: BackgroundMusicProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState(() => readMuted());
  const [ready, setReady] = useState(false);

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
    const onFirstGesture = () => {
      const audio = audioRef.current;
      if (!audio || muted || ready) return;
      audio
        .play()
        .then(() => {
          fadeTo(audio, TARGET_VOLUME, () => setReady(true));
        })
        .catch(() => {
          return;
        });
    };
    window.addEventListener("pointerdown", onFirstGesture, { once: true });
    return () => window.removeEventListener("pointerdown", onFirstGesture);
  }, [muted, ready]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) {
      setMuted((m) => !m);
      return;
    }

    if (muted) {
      setMuted(false);
      audio.volume = 0;
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
    fadeTo(audio, 0, () => {
      audio.pause();
      setReady(false);
    });
  };

  return (
    <>
      <audio ref={audioRef} src={EVENT_CONFIG.backgroundMusicSrc} />
      <button
        type="button"
        onClick={toggle}
        className="fixed top-16 right-4 z-50 flex items-center gap-2 bg-card border border-border rounded-full px-3 py-2 shadow-md hover:shadow-lg transition-all font-body text-sm text-foreground"
        aria-label={muted ? labels.unmute : labels.mute}
        title={muted ? labels.unmute : labels.mute}
      >
        {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        <span>{lang === "pt" ? "Música" : "Music"}</span>
      </button>
    </>
  );
};

export default BackgroundMusic;
