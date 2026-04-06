import { EVENT_CONFIG } from "@/lib/eventConfig";
import { normalizeWhatsAppNumber } from "@/lib/utils";
import { MessageCircle } from "lucide-react";

const FloatingWhatsApp = () => {
  const url = `https://wa.me/${normalizeWhatsAppNumber(EVENT_CONFIG.whatsappNumber)}`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="floating-btn bg-success"
      aria-label="WhatsApp"
    >
      <MessageCircle className="w-7 h-7 text-success-foreground" />
    </a>
  );
};

export default FloatingWhatsApp;
