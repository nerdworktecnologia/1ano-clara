import { useState, useRef } from "react";
import { Lang, t } from "@/lib/i18n";
import { EVENT_CONFIG } from "@/lib/eventConfig";
import {
  getRSVPs,
  getGuests,
  saveGuest,
  importGuests,
  markInvited,
  type RSVPEntry,
  type GuestEntry,
} from "@/lib/storage";
import { Download, Upload, Send, Users, UserCheck, UserX, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const AdminPage = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [lang, setLang] = useState<Lang>("pt");
  const [rsvps, setRsvps] = useState<RSVPEntry[]>([]);
  const [guests, setGuests] = useState<GuestEntry[]>([]);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const login = () => {
    if (password === EVENT_CONFIG.adminPassword) {
      setAuthenticated(true);
      setRsvps(getRSVPs());
      setGuests(getGuests());
    }
  };

  const addGuest = () => {
    if (!newName.trim() || !newPhone.trim()) return;
    const g = saveGuest({ name: newName.trim(), phone: newPhone.trim() });
    setGuests((prev) => [...prev, g]);
    setNewName("");
    setNewPhone("");
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split("\n").filter(Boolean);
      const list = lines.map((line) => {
        const [name, phone] = line.split(",").map((s) => s.trim());
        return { name, phone };
      }).filter((g) => g.name && g.phone);
      importGuests(list);
      setGuests(getGuests());
    };
    reader.readAsText(file);
  };

  const sendInvite = (guest: GuestEntry) => {
    const msg = t(lang, "inviteMsg")
      .replace("{name}", guest.name)
      .replace("{link}", `${EVENT_CONFIG.siteUrl}?lang=${lang}`);
    const url = `https://wa.me/${guest.phone.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
    markInvited(guest.id);
    setGuests(getGuests());
  };

  const exportCSV = () => {
    const header = "Nome,Comparece,Adultos,Crianças,Telefone,Observações,Data\n";
    const rows = rsvps
      .map((r) => `"${r.name}",${r.attending ? "Sim" : "Não"},${r.adults},${r.children},"${r.phone}","${r.notes}","${r.createdAt}"`)
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "rsvp_respostas.csv";
    a.click();
  };

  const confirmed = rsvps.filter((r) => r.attending);
  const declined = rsvps.filter((r) => !r.attending);
  const totalAdults = confirmed.reduce((s, r) => s + r.adults, 0);
  const totalChildren = confirmed.reduce((s, r) => s + r.children, 0);

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-background">
        <div className="card-baby w-full max-w-sm text-center">
          <h1 className="section-title mb-6">{t(lang, "adminTitle")}</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t(lang, "adminPassword")}
            className="w-full px-4 py-3 rounded-xl border border-input bg-background font-body mb-4 focus:outline-none focus:ring-2 focus:ring-primary"
            onKeyDown={(e) => e.key === "Enter" && login()}
          />
          <button onClick={login} className="btn-primary w-full">
            {t(lang, "adminLogin")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="section-title mb-0">{t(lang, "adminTitle")}</h1>
          <Link to="/" className="btn-secondary flex items-center gap-2 text-sm">
            <ArrowLeft className="w-4 h-4" /> {t(lang, "backToInvite")}
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card-baby text-center">
            <UserCheck className="w-6 h-6 text-success mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">{confirmed.length}</div>
            <div className="text-xs text-muted-foreground">{t(lang, "confirmed")}</div>
          </div>
          <div className="card-baby text-center">
            <UserX className="w-6 h-6 text-destructive mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">{declined.length}</div>
            <div className="text-xs text-muted-foreground">{t(lang, "declined")}</div>
          </div>
          <div className="card-baby text-center">
            <Users className="w-6 h-6 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">{totalAdults}</div>
            <div className="text-xs text-muted-foreground">{t(lang, "totalAdults")}</div>
          </div>
          <div className="card-baby text-center">
            <Users className="w-6 h-6 text-secondary mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">{totalChildren}</div>
            <div className="text-xs text-muted-foreground">{t(lang, "totalChildren")}</div>
          </div>
        </div>

        {/* RSVP List */}
        <div className="card-baby mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold font-body text-foreground">RSVPs ({rsvps.length})</h2>
            <button onClick={exportCSV} className="btn-secondary flex items-center gap-2 text-sm">
              <Download className="w-4 h-4" /> {t(lang, "export")}
            </button>
          </div>
          {rsvps.length === 0 ? (
            <p className="text-muted-foreground text-center py-4 font-body">Nenhuma resposta ainda.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-body">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-2">{t(lang, "name")}</th>
                    <th className="text-left py-2 px-2">{t(lang, "attending")}</th>
                    <th className="text-left py-2 px-2">{t(lang, "adults")}</th>
                    <th className="text-left py-2 px-2">{t(lang, "children")}</th>
                    <th className="text-left py-2 px-2">{t(lang, "phone")}</th>
                  </tr>
                </thead>
                <tbody>
                  {rsvps.map((r) => (
                    <tr key={r.id} className="border-b border-border/50">
                      <td className="py-2 px-2">{r.name}</td>
                      <td className="py-2 px-2">{r.attending ? "✅" : "❌"}</td>
                      <td className="py-2 px-2">{r.adults}</td>
                      <td className="py-2 px-2">{r.children}</td>
                      <td className="py-2 px-2">{r.phone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Guest Management */}
        <div className="card-baby">
          <h2 className="text-xl font-bold font-body text-foreground mb-4">{t(lang, "guestList")}</h2>

          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={t(lang, "name")}
              className="flex-1 px-4 py-2 rounded-xl border border-input bg-background font-body focus:outline-none focus:ring-2 focus:ring-primary"
              maxLength={100}
            />
            <input
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              placeholder={t(lang, "phone")}
              className="flex-1 px-4 py-2 rounded-xl border border-input bg-background font-body focus:outline-none focus:ring-2 focus:ring-primary"
              maxLength={20}
            />
            <button onClick={addGuest} className="btn-primary py-2 text-sm">
              {t(lang, "addGuest")}
            </button>
          </div>

          <div className="flex gap-2 mb-4">
            <input ref={fileRef} type="file" accept=".csv,.txt" onChange={handleImport} className="hidden" />
            <button onClick={() => fileRef.current?.click()} className="btn-secondary flex items-center gap-2 text-sm">
              <Upload className="w-4 h-4" /> {t(lang, "import")}
            </button>
            <button
              onClick={() => guests.filter((g) => !g.invited).forEach((g) => sendInvite(g))}
              className="btn-whatsapp flex items-center gap-2 text-sm"
            >
              <Send className="w-4 h-4" /> {t(lang, "sendAll")}
            </button>
          </div>

          {guests.length > 0 && (
            <div className="space-y-2">
              {guests.map((g) => (
                <div key={g.id} className="flex items-center justify-between py-2 px-3 rounded-xl bg-muted/50">
                  <div>
                    <span className="font-semibold font-body">{g.name}</span>
                    <span className="text-muted-foreground text-sm ml-2">{g.phone}</span>
                    {g.invited && <span className="ml-2 text-xs text-success">✓ Enviado</span>}
                  </div>
                  {!g.invited && (
                    <button onClick={() => sendInvite(g)} className="btn-whatsapp text-xs py-1 px-3">
                      <Send className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
