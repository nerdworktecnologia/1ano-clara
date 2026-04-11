import { Lang } from "@/lib/i18n";

interface LangToggleProps {
  lang: Lang;
  onToggle: () => void;
}

const LangToggle = ({ lang, onToggle }: LangToggleProps) => (
  <button
    onClick={onToggle}
    className="fixed top-4 right-4 z-50 flex items-center justify-center bg-card border border-border rounded-full w-11 h-11 shadow-md hover:shadow-lg transition-all font-body text-sm text-foreground"
    aria-label={lang === "pt" ? "Switch to English" : "Mudar para Português"}
    title={lang === "pt" ? "English" : "Português"}
  >
    <span aria-hidden="true" className="text-lg leading-none">
      {lang === "pt" ? "🇺🇸" : "🇧🇷"}
    </span>
  </button>
);

export default LangToggle;
