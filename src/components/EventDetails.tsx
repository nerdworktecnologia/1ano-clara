import { Lang, t } from "@/lib/i18n";
import { EVENT_CONFIG } from "@/lib/eventConfig";
import { capitalizeFirstLetter, normalizeWhatsAppNumber } from "@/lib/utils";
import { CalendarDays, Clock, MapPin } from "lucide-react";

interface EventDetailsProps {
  lang: Lang;
}

export const GiftsSection = ({ lang }: EventDetailsProps) => {
  return (
    <section className="py-12 px-4">
      <h2 className="section-title text-center">{t(lang, "giftsTitle")}</h2>
      <div className="max-w-lg mx-auto card-baby space-y-6">
        <p className="text-muted-foreground font-body leading-relaxed">{t(lang, "giftsText")}</p>

        <div className="grid gap-4">
          <div className="rounded-xl border border-border bg-background/50 p-4">
            <p className="font-bold font-body text-foreground mb-2">{t(lang, "pixLabel")}</p>
            <div className="space-y-1 text-sm font-body">
              <p>
                <span className="text-muted-foreground">{t(lang, "cpfLabel")}: </span>
                <span className="font-semibold text-foreground">648.489.907-00</span>
              </p>
              <p>
                <span className="text-muted-foreground">{t(lang, "nameLabel")}: </span>
                <span className="font-semibold text-foreground">Maria José Seabra Chirigati</span>
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-background/50 p-4">
            <p className="font-bold font-body text-foreground mb-2">{t(lang, "venmoLabel")}</p>
            <div className="space-y-1 text-sm font-body">
              <p className="font-semibold text-foreground">@fchirigati</p>
              <p>
                <span className="text-muted-foreground">{t(lang, "lastDigitsLabel")}: </span>
                <span className="font-semibold text-foreground">1832</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const EventDetails = ({ lang }: EventDetailsProps) => {
  const dateStr = capitalizeFirstLetter(
    new Date(EVENT_CONFIG.eventDate).toLocaleDateString(lang === "pt" ? "pt-BR" : "en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  );

  const inviteTemplate = t(lang, "arraiaInvite");
  const inviteParts = inviteTemplate.split("{festaJunina}");
  const inviteBeforeFesta = inviteParts[0] ?? "";
  const inviteAfterFesta = inviteParts[1] ?? "";
  const inviteAfterSplit = inviteAfterFesta.split("{forro}");
  const inviteBetween = inviteAfterSplit[0] ?? "";
  const inviteAfterForro = inviteAfterSplit[1] ?? "";

  const bauernfestTemplate = t(lang, "bauernfestNote");
  const bauernfestParts = bauernfestTemplate.split("{bauernfest}");
  const bauernfestUrl = "https://bauernfest.org/";
  const villaPhone = "+55 24 99837-3694";
  const villaWhatsAppUrl = `https://wa.me/${normalizeWhatsAppNumber(villaPhone)}`;
  const granjaPhone = "+55 24 99827-5427";
  const granjaWhatsAppUrl = `https://wa.me/${normalizeWhatsAppNumber(granjaPhone)}`;

  return (
    <section className="py-12 px-4">
      <h2 className="section-title text-center">{t(lang, "eventDetails")}</h2>
      <div className="max-w-lg mx-auto card-baby space-y-6">
        <p className="text-muted-foreground font-body leading-relaxed">
          {inviteBeforeFesta}
          {lang === "en" ? (
            <a
              href="https://en.wikipedia.org/wiki/Festa_Junina"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4"
            >
              Festa Junina
            </a>
          ) : (
            "festa junina"
          )}
          {inviteBetween}
          {lang === "en" ? (
            <a
              href="https://en.wikipedia.org/wiki/Forr%C3%B3"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4"
            >
              forró
            </a>
          ) : (
            "forró"
          )}
          {inviteAfterForro}
        </p>

        <div className="h-px bg-border" />
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

        <div className="h-px bg-border" />

        <p className="text-muted-foreground font-body leading-relaxed">
          {bauernfestParts[0] ?? ""}
          <a href={bauernfestUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
            Bauernfest
          </a>
          {bauernfestParts[1] ?? ""}
          <a href={bauernfestUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
            Bauernfest
          </a>
          {bauernfestParts[2] ?? ""}
        </p>

        <div className="rounded-xl border border-border bg-background/50 p-4">
          <p className="font-bold font-body text-foreground mb-3">{t(lang, "hotelsTitle")}</p>
          <div className="space-y-3 text-sm font-body">
            <div>
              <p className="font-semibold text-foreground">Eventos - Villa Itaipava</p>
              <a
                href={villaWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground underline underline-offset-4"
              >
                {villaPhone}
              </a>
            </div>
            <div>
              <p className="font-semibold text-foreground">Paulo Miguez - Central de Reservas Granja Brasil</p>
              <a
                href={granjaWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground underline underline-offset-4"
              >
                {granjaPhone}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventDetails;
