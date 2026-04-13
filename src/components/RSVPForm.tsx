import { useState } from "react";
import { Lang, t } from "@/lib/i18n";
import { saveRSVP } from "@/lib/storage";
import { normalizeWhatsAppNumber } from "@/lib/utils";
import confetti from "canvas-confetti";

interface RSVPFormProps {
  lang: Lang;
}

const RSVPForm = ({ lang }: RSVPFormProps) => {
  const [form, setForm] = useState({
    name: "",
    attending: true,
    adults: "1",
    children: "0",
    phone: "",
    notes: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [submitError, setSubmitError] = useState(false);

  const validate = () => {
    const e: Record<string, boolean> = {};
    if (!form.name.trim()) e.name = true;
    if (!form.phone.trim()) e.phone = true;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const finalForm = {
      ...form,
      adults: Number(form.adults) || 0,
      children: Number(form.children) || 0,
    };

    try {
      saveRSVP(finalForm);
      setSubmitted(true);
      setSubmitError(false);
    } catch {
      setSubmitError(true);
      return;
    }

    if (finalForm.attending) {
      // Festa junina confetti colors
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#CC3333", "#E6A817", "#D4731A", "#4D8033", "#3375B8", "#CC4488"],
      });
    }
  };

  const supportNumber = "5521997914496";
  const supportMsg = t(lang, "rsvpSupportMsg")
    .replace("{responsible}", form.name.trim() || "-")
    .replace("{phone}", form.phone.trim() || "-");
  const supportUrl = `https://wa.me/${normalizeWhatsAppNumber(supportNumber)}?text=${encodeURIComponent(supportMsg)}`;

  if (submitted) {
    return (
      <section className="py-12 px-4" id="rsvp">
        <div className="max-w-lg mx-auto card-baby text-center animate-fade-up">
          <div className="text-6xl mb-4">🎪</div>
          <h2 className="section-title">{t(lang, "thankYouTitle")}</h2>
          <p className="text-muted-foreground font-body mb-6">{t(lang, "thankYouMsg")}</p>
          <div className="mt-4">
            <p className="text-muted-foreground text-sm font-body mb-2">{t(lang, "rsvpSupportText")}</p>
            <a href={supportUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary inline-block">
              💬 {t(lang, "rsvpSupportCta")}
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 px-4" id="rsvp">
      <h2 className="section-title text-center">🎪 {t(lang, "rsvpTitle")}</h2>
      <form onSubmit={handleSubmit} className="max-w-lg mx-auto card-baby space-y-5">
        <div>
          <label className="block text-sm font-bold font-body mb-1">{t(lang, "fullName")} *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={`w-full px-4 py-3 rounded-lg border bg-background font-body focus:outline-none focus:ring-2 focus:ring-primary ${errors.name ? "border-destructive" : "border-input"}`}
            maxLength={100}
          />
          {errors.name && <p className="text-destructive text-xs mt-1">{t(lang, "required")}</p>}
        </div>

        <div>
          <label className="block text-sm font-bold font-body mb-1">{t(lang, "attending")} *</label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setForm({ ...form, attending: true })}
              className={`flex-1 py-3 rounded-lg font-body font-bold transition-all ${form.attending ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            >
              ✅ {t(lang, "yes")}
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, attending: false })}
              className={`flex-1 py-3 rounded-lg font-body font-bold transition-all ${!form.attending ? "bg-destructive text-destructive-foreground" : "bg-muted text-muted-foreground"}`}
            >
              ❌ {t(lang, "no")}
            </button>
          </div>
        </div>

        {form.attending && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold font-body mb-1">{t(lang, "adults")}</label>
              <input
                type="number"
                min={1}
                max={20}
                value={form.adults}
                onChange={(e) => {
                  const val = e.target.value;
                  setForm({ ...form, adults: val.replace(/^0+(?=\d)/, '') });
                }}
                className="w-full px-4 py-3 rounded-lg border border-input bg-background font-body focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-bold font-body mb-1">{t(lang, "children")}</label>
              <input
                type="number"
                min={0}
                max={20}
                value={form.children}
                onChange={(e) => {
                  const val = e.target.value;
                  setForm({ ...form, children: val === "" ? "" : val.replace(/^0+(?=\d)/, '') });
                }}
                className="w-full px-4 py-3 rounded-lg border border-input bg-background font-body focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-bold font-body mb-1">{t(lang, "phone")} *</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className={`w-full px-4 py-3 rounded-lg border bg-background font-body focus:outline-none focus:ring-2 focus:ring-primary ${errors.phone ? "border-destructive" : "border-input"}`}
            placeholder="+55 11 99999-9999"
            maxLength={20}
          />
          {errors.phone && <p className="text-destructive text-xs mt-1">{t(lang, "required")}</p>}
        </div>

        <div>
          <label className="block text-sm font-bold font-body mb-1">{t(lang, "notes")}</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border border-input bg-background font-body focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            rows={3}
            maxLength={500}
          />
        </div>

        <button type="submit" className="btn-primary w-full text-center">
          🎪 {t(lang, "submit")}
        </button>

        <div className="pt-2 text-center">
          <p className="text-muted-foreground text-sm font-body mb-2">{t(lang, "rsvpSupportText")}</p>
          <a
            href={supportUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={(submitError || Object.keys(errors).length > 0) ? "btn-whatsapp inline-block" : "btn-secondary inline-block"}
          >
            💬 {t(lang, "rsvpSupportCta")}
          </a>
        </div>
      </form>
    </section>
  );
};

export default RSVPForm;
