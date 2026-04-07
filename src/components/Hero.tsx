import { Lang, t } from "@/lib/i18n";
import { EVENT_CONFIG } from "@/lib/eventConfig";
import Bandeirinhas from "./Bandeirinhas";

interface HeroProps {
  lang: Lang;
  onRSVPClick: () => void;
}

const Hero = ({ lang, onRSVPClick }: HeroProps) => {
  return (
    <section className="relative min-h-[80vh] flex flex-col items-center justify-center text-center px-4 py-16 overflow-hidden">
      <div className="hero-bg" aria-hidden="true" />
      {/* Top bandeirinhas */}
      <div className="absolute top-0 left-0 right-0">
        <Bandeirinhas count={30} />
      </div>

      {/* Decorative elements - festive items */}
      <div className="absolute top-16 left-8 text-4xl animate-sway" style={{ animationDelay: "0s" }}>🌽</div>
      <div className="absolute top-24 right-12 text-3xl animate-sway" style={{ animationDelay: "0.5s" }}>🎆</div>
      <div className="absolute bottom-20 left-16 text-3xl animate-sway" style={{ animationDelay: "1s" }}>🔥</div>
      <div className="absolute bottom-32 right-8 text-4xl animate-sway" style={{ animationDelay: "1.5s" }}>🎶</div>
      <div className="absolute top-40 left-1/4 text-2xl animate-float" style={{ animationDelay: "0.3s" }}>⭐</div>
      <div className="absolute bottom-40 right-1/4 text-2xl animate-float" style={{ animationDelay: "0.8s" }}>🪗</div>

      <div className="animate-fade-up relative z-10 mt-8">
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
          🎪 {t(lang, "confirmPresence")}
        </button>
      </div>

      {/* Bottom bandeirinhas */}
      <div className="absolute bottom-0 left-0 right-0">
        <Bandeirinhas count={30} />
      </div>
    </section>
  );
};

export default Hero;
