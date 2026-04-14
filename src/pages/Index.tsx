import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Lang } from "@/lib/i18n";
import Hero from "@/components/Hero";
import Countdown from "@/components/Countdown";
import EventDetails, { GiftsSection } from "@/components/EventDetails";
import RSVPForm from "@/components/RSVPForm";
import LangToggle from "@/components/LangToggle";
import Bandeirinhas from "@/components/Bandeirinhas";
import Fogueira from "@/components/Fogueira";
import BackgroundMusic from "@/components/BackgroundMusic";

const Index = () => {
  const [searchParams] = useSearchParams();
  const initialLang = (searchParams.get("lang") as Lang) || "pt";
  const initialName = searchParams.get("name") || "";
  const [lang, setLang] = useState<Lang>(initialLang);

  const scrollToRSVP = () => {
    document.getElementById("rsvp")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <LangToggle lang={lang} onToggle={() => setLang(lang === "pt" ? "en" : "pt")} />
      <BackgroundMusic lang={lang} />
      <Hero lang={lang} onRSVPClick={scrollToRSVP} />
      <Bandeirinhas count={25} />
      <Countdown lang={lang} />
      <Bandeirinhas count={25} />
      <EventDetails lang={lang} />
      <Bandeirinhas count={25} />
      <GiftsSection lang={lang} />
      <Bandeirinhas count={25} />
      <RSVPForm lang={lang} initialName={initialName} />
      <footer className="text-center py-8 text-muted-foreground text-sm font-body">
        <Bandeirinhas count={25} />
        <div className="mt-6 flex justify-center">
          <Fogueira />
        </div>
        <p className="mt-4">Desenvolvido por Caroline Brand Studio * Feito com 💖</p>
      </footer>
    </div>
  );
};

export default Index;
