import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Lang } from "@/lib/i18n";
import Hero from "@/components/Hero";
import Countdown from "@/components/Countdown";
import EventDetails from "@/components/EventDetails";
import RSVPForm from "@/components/RSVPForm";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import LangToggle from "@/components/LangToggle";

const Index = () => {
  const [searchParams] = useSearchParams();
  const initialLang = (searchParams.get("lang") as Lang) || "pt";
  const [lang, setLang] = useState<Lang>(initialLang);

  const scrollToRSVP = () => {
    document.getElementById("rsvp")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <LangToggle lang={lang} onToggle={() => setLang(lang === "pt" ? "en" : "pt")} />
      <Hero lang={lang} onRSVPClick={scrollToRSVP} />
      <Countdown lang={lang} />
      <EventDetails lang={lang} />
      <RSVPForm lang={lang} />
      <footer className="text-center py-8 text-muted-foreground text-sm font-body">
        Made with 💖
      </footer>
      <FloatingWhatsApp />
    </div>
  );
};

export default Index;
