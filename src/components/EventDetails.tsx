import { Lang, t } from "@/lib/i18n";
import { EVENT_CONFIG } from "@/lib/eventConfig";
import { CalendarDays, Clock, MapPin } from "lucide-react";

interface EventDetailsProps {
  lang: Lang;
}

const EventDetails = ({ lang }: EventDetailsProps) => {
  const dateStr = new Date(EVENT_CONFIG.eventDate).toLocaleDateString(
    lang === "pt" ? "pt-BR" : "en-US",
    { weekday: "long", year: "numeric", month: "long", day: "numeric" }
  );

  return (
    <section className="py-12 px-4">
      <h2 className="section-title text-center">{t(lang, "eventDetails")}</h2>
      <div className="max-w-lg mx-auto card-baby space-y-6">
        <div className="flex items-center gap-4">
          <CalendarDays className="w-6 h-6 text-primary shrink-0" />
          <div>
            <p className="text-sm text-muted-foreground font-body">{t(lang, "date")}</p>
            <p className="font-semibold font-body">{dateStr}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Clock className="w-6 h-6 text-primary shrink-0" />
          <div>
            <p className="text-sm text-muted-foreground font-body">{t(lang, "time")}</p>
            <p className="font-semibold font-body">{EVENT_CONFIG.eventTime}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <MapPin className="w-6 h-6 text-primary shrink-0" />
          <div>
            <p className="text-sm text-muted-foreground font-body">{t(lang, "address")}</p>
            <p className="font-semibold font-body">{EVENT_CONFIG.address}</p>
          </div>
        </div>
        <a
          href={EVENT_CONFIG.mapsLink}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary block text-center w-full"
        >
          📍 {t(lang, "openMaps")}
        </a>
      </div>
    </section>
  );
};

export default EventDetails;
