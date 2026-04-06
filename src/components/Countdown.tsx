import { useEffect, useState } from "react";
import { Lang, t } from "@/lib/i18n";
import { EVENT_CONFIG } from "@/lib/eventConfig";

interface CountdownProps {
  lang: Lang;
}

const Countdown = ({ lang }: CountdownProps) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const target = new Date(EVENT_CONFIG.eventDate).getTime();
    const update = () => {
      const now = Date.now();
      const diff = Math.max(0, target - now);
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  const units = [
    { value: timeLeft.days, label: t(lang, "days") },
    { value: timeLeft.hours, label: t(lang, "hours") },
    { value: timeLeft.minutes, label: t(lang, "minutes") },
    { value: timeLeft.seconds, label: t(lang, "seconds") },
  ];

  return (
    <section className="py-12 px-4">
      <h2 className="section-title text-center">{t(lang, "countdown")}</h2>
      <div className="flex justify-center gap-4 md:gap-8">
        {units.map((u) => (
          <div key={u.label} className="card-baby text-center min-w-[70px] md:min-w-[100px]">
            <div className="text-3xl md:text-5xl font-bold text-primary font-body">
              {String(u.value).padStart(2, "0")}
            </div>
            <div className="text-xs md:text-sm text-muted-foreground font-body mt-1">{u.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Countdown;
