import { Lang, t } from "@/lib/i18n";
import { EVENT_CONFIG } from "@/lib/eventConfig";

interface HeroProps {
  lang: Lang;
  onRSVPClick: () => void;
}

const Hero = ({ lang, onRSVPClick }: HeroProps) => {
  return (
    <section className="relative min-h-[80vh] flex flex-col items-center justify-center text-center px-4 py-16 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-16 h-16 rounded-full bg-secondary/40 animate-float" />
      <div className="absolute top-20 right-16 w-10 h-10 rounded-full bg-primary/30 animate-float" style={{ animationDelay: "1s" }} />
      <div className="absolute bottom-20 left-20 w-12 h-12 rounded-full bg-accent/50 animate-float" style={{ animationDelay: "0.5s" }} />
      <div className="absolute bottom-32 right-10 w-8 h-8 rounded-full bg-secondary/30 animate-float" style={{ animationDelay: "1.5s" }} />

      <div className="animate-fade-up relative z-10">
        <p className="text-lg md:text-xl font-body text-muted-foreground mb-2">
          {t(lang, "heroSubtitle")}
        </p>
        <h1 className="text-5xl md:text-7xl font-heading text-primary mb-4 animate-bounce-soft">
          {t(lang, "heroAge")}
        </h1>
        <p className="text-4xl md:text-6xl font-heading text-foreground mb-8">
          {EVENT_CONFIG.childName}
        </p>
        <p className="text-muted-foreground font-body text-base md:text-lg mb-2">
          📅 {new Date(EVENT_CONFIG.eventDate).toLocaleDateString(lang === "pt" ? "pt-BR" : "en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
        <p className="text-muted-foreground font-body text-base md:text-lg mb-8">
          🕐 {EVENT_CONFIG.eventTime} &nbsp;|&nbsp; 📍 {EVENT_CONFIG.address.split(",")[0]}
        </p>
        <button onClick={onRSVPClick} className="btn-primary text-xl">
          🎈 {t(lang, "confirmPresence")}
        </button>
      </div>

      {/* Stars/sparkles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <span
            key={i}
            className="absolute text-2xl animate-float opacity-30"
            style={{
              top: `${15 + Math.random() * 70}%`,
              left: `${5 + Math.random() * 90}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          >
            ✨
          </span>
        ))}
      </div>
    </section>
  );
};

export default Hero;
