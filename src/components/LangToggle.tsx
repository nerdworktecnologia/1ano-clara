import { Lang, t } from "@/lib/i18n";
import { Globe } from "lucide-react";

interface LangToggleProps {
  lang: Lang;
  onToggle: () => void;
}

const LangToggle = ({ lang, onToggle }: LangToggleProps) => (
  <button
    onClick={onToggle}
    className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2 shadow-md hover:shadow-lg transition-all font-body text-sm text-foreground"
  >
    <Globe className="w-4 h-4" />
    {t(lang, "langSwitch")}
  </button>
);

export default LangToggle;
