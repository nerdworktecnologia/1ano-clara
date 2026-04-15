import { useState, useRef } from "react";
import { Lang, t } from "@/lib/i18n";
import { EVENT_CONFIG } from "@/lib/eventConfig";
import {
  getRSVPs,
  loadRSVPs,
  getGuests,
  saveGuest,
  importGuests,
  updateRSVP,
  deleteRSVP,
  markInvited,
  clearGuests,
  clearInvitedGuests,
  type RSVPEntry,
  type GuestEntry,
} from "@/lib/storage";
import { normalizeWhatsAppNumber } from "@/lib/utils";
import { Download, Upload, Send, Users, UserCheck, UserX, ArrowLeft, Pencil, Trash2, Check, X } from "lucide-react";
import { Link } from "react-router-dom";

const AdminPage = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [lang, setLang] = useState<Lang>("pt");
  const [rsvps, setRsvps] = useState<RSVPEntry[]>([]);
  const [editingRsvpId, setEditingRsvpId] = useState<string | null>(null);
  const [editingRsvp, setEditingRsvp] = useState<{
    name: string;
    attending: boolean;
    adults: number;
    children: number;
    phone: string;
    notes: string;
  } | null>(null);
  const [guests, setGuests] = useState<GuestEntry[]>([]);
  const [bulkPending, setBulkPending] = useState<GuestEntry[]>([]);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newPeople, setNewPeople] = useState("");
  const [newLang, setNewLang] = useState<Lang>("pt");
  const [newCategory, setNewCategory] = useState<"adult" | "child">("adult");
  const fileRef = useRef<HTMLInputElement>(null);

  const login = async () => {
    if (password === EVENT_CONFIG.adminPassword) {
      setAuthenticated(true);
      const entries = await loadRSVPs();
      setRsvps(entries);
      setGuests(getGuests());
    }
  };

  const addGuest = () => {
    if (!newName.trim() || !newPhone.trim()) return;
    const g = saveGuest({
      name: newName.trim(),
      phone: newPhone.trim(),
      people: newPeople.trim(),
      lang: newLang,
      category: newCategory,
    });
    setGuests((prev) => [...prev, g]);
    setNewName("");
    setNewPhone("");
    setNewPeople("");
    setNewLang("pt");
    setNewCategory("adult");
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      const header = lines[0];
      const delim = header.includes(";") ? ";" : ",";
      const data = header.toLowerCase().includes("nome") ? lines.slice(1) : lines;
      const list = data
        .map((line) => {
          const parts = line.split(delim).map((s) => s.trim());
          const [name, phone, langRaw, categoryRaw, people] = parts;
          const lang = (langRaw || "pt").toLowerCase() === "en" ? "en" : "pt";
          const category = (categoryRaw || "adulto").toLowerCase().startsWith("crian") ? "child" : "adult";
          return { name, phone, people, lang, category };
        })
        .filter((g) => g.name && g.phone);
      importGuests(list);
      setGuests(getGuests());
    };
    reader.readAsText(file);
  };

  const sendInvite = (guest: GuestEntry) => {
    const gLang: Lang = guest.lang;
    const rawInvitees = (guest.people || "").trim();
    const invitees = rawInvitees
      ? rawInvitees
          .split(/[\r\n,;]+/g)
          .map((s) => s.trim())
          .filter((s) => s.length > 0)
      : [guest.name];
    const inviteesList = invitees.map((n) => `- ${n}`).join("\n");
    const key = invitees.length > 1 ? "inviteMsgMulti" : "inviteMsgSingle";

    const msg = t(gLang, key)
      .replace("{inviteesHeader}", t(gLang, "inviteesHeader"))
      .replace("{inviteesList}", inviteesList)
      .replace("{name}", guest.name)
      .replace(
        "{link}",
        `${EVENT_CONFIG.siteUrl}/${gLang}?name=${encodeURIComponent(guest.name)}${invitees.length > 1 ? `&invitees=${encodeURIComponent(invitees.join("|"))}` : ""}`,
      );
    const url = `https://wa.me/${normalizeWhatsAppNumber(guest.phone)}?text=${encodeURIComponent(msg)}`;
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

  const startEditRsvp = (r: RSVPEntry) => {
    setEditingRsvpId(r.id);
    setEditingRsvp({
      name: r.name,
      attending: r.attending,
      adults: r.adults,
      children: r.children,
      phone: r.phone,
      notes: r.notes || "",
    });
  };

  const cancelEditRsvp = () => {
    setEditingRsvpId(null);
    setEditingRsvp(null);
  };

  const saveEditRsvp = (id: string) => {
    if (!editingRsvp) return;
    updateRSVP(id, {
      name: editingRsvp.name,
      attending: editingRsvp.attending,
      adults: editingRsvp.adults,
      children: editingRsvp.children,
      phone: editingRsvp.phone,
      notes: editingRsvp.notes,
    });
    setRsvps(getRSVPs());
    cancelEditRsvp();
  };

  const removeRsvp = (id: string) => {
    const ok = window.confirm("Remover este RSVP?");
    if (!ok) return;
    deleteRSVP(id);
    setRsvps(getRSVPs());
    if (editingRsvpId === id) cancelEditRsvp();
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
                    <th className="text-left py-2 px-2">{t(lang, "notes")}</th>
                    <th className="text-right py-2 px-2">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {rsvps.map((r) => {
                    const isEditing = editingRsvpId === r.id && !!editingRsvp;
                    return (
                      <tr key={r.id} className="border-b border-border/50">
                        <td className="py-2 px-2">
                          {isEditing ? (
                            <input
                              value={editingRsvp.name}
                              onChange={(e) => setEditingRsvp({ ...editingRsvp, name: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg border border-input bg-background font-body"
                              maxLength={100}
                            />
                          ) : (
                            r.name
                          )}
                        </td>
                        <td className="py-2 px-2">
                          {isEditing ? (
                            <select
                              value={editingRsvp.attending ? "yes" : "no"}
                              onChange={(e) => setEditingRsvp({ ...editingRsvp, attending: e.target.value === "yes" })}
                              className="px-3 py-2 rounded-lg border border-input bg-background font-body"
                            >
                              <option value="yes">✅</option>
                              <option value="no">❌</option>
                            </select>
                          ) : (
                            (r.attending ? "✅" : "❌")
                          )}
                        </td>
                        <td className="py-2 px-2">
                          {isEditing ? (
                            <input
                              type="number"
                              min={0}
                              max={30}
                              value={editingRsvp.adults}
                              onChange={(e) => setEditingRsvp({ ...editingRsvp, adults: Number(e.target.value) })}
                              className="w-24 px-3 py-2 rounded-lg border border-input bg-background font-body"
                            />
                          ) : (
                            r.adults
                          )}
                        </td>
                        <td className="py-2 px-2">
                          {isEditing ? (
                            <input
                              type="number"
                              min={0}
                              max={30}
                              value={editingRsvp.children}
                              onChange={(e) => setEditingRsvp({ ...editingRsvp, children: Number(e.target.value) })}
                              className="w-24 px-3 py-2 rounded-lg border border-input bg-background font-body"
                            />
                          ) : (
                            r.children
                          )}
                        </td>
                        <td className="py-2 px-2">
                          {isEditing ? (
                            <input
                              value={editingRsvp.phone}
                              onChange={(e) => setEditingRsvp({ ...editingRsvp, phone: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg border border-input bg-background font-body"
                              maxLength={30}
                            />
                          ) : (
                            r.phone
                          )}
                        </td>
                        <td className="py-2 px-2">
                          {isEditing ? (
                            <textarea
                              value={editingRsvp.notes}
                              onChange={(e) => setEditingRsvp({ ...editingRsvp, notes: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg border border-input bg-background font-body resize-none"
                              rows={2}
                              maxLength={500}
                            />
                          ) : (
                            <span className="block max-w-xs truncate" title={r.notes || ""}>
                              {r.notes || "-"}
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-2">
                          <div className="flex justify-end gap-2">
                            {isEditing ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => saveEditRsvp(r.id)}
                                  className="p-2 rounded-lg hover:bg-muted"
                                  aria-label="Salvar"
                                  title="Salvar"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={cancelEditRsvp}
                                  className="p-2 rounded-lg hover:bg-muted"
                                  aria-label="Cancelar"
                                  title="Cancelar"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => startEditRsvp(r)}
                                  className="p-2 rounded-lg hover:bg-muted"
                                  aria-label="Editar"
                                  title="Editar"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeRsvp(r.id)}
                                  className="p-2 rounded-lg hover:bg-muted"
                                  aria-label="Remover"
                                  title="Remover"
                                >
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Guest Management */}
        <div className="card-baby">
          <h2 className="text-xl font-bold font-body text-foreground mb-4">{t(lang, "guestList")}</h2>

          <div className="space-y-2 mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={t(lang, "name")}
                className="w-full px-4 py-2 rounded-xl border border-input bg-background font-body focus:outline-none focus:ring-2 focus:ring-primary"
                maxLength={100}
              />
              <input
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder={t(lang, "phone")}
                className="w-full px-4 py-2 rounded-xl border border-input bg-background font-body focus:outline-none focus:ring-2 focus:ring-primary"
                maxLength={20}
              />
            </div>

            <textarea
              value={newPeople}
              onChange={(e) => setNewPeople(e.target.value)}
              placeholder={lang === "pt" ? "Convidados (um por linha)" : "Invitees (one per line)"}
              className="w-full px-4 py-2 rounded-xl border border-input bg-background font-body focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows={3}
              maxLength={500}
            />

            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={newLang}
                onChange={(e) => setNewLang(e.target.value as Lang)}
                className="px-3 py-2 rounded-xl border border-input bg-background font-body"
                aria-label="Idioma"
                title="Idioma"
              >
                <option value="pt">pt</option>
                <option value="en">en</option>
              </select>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as "adult" | "child")}
                className="px-3 py-2 rounded-xl border border-input bg-background font-body"
                aria-label="Tipo"
                title="Tipo"
              >
                <option value="adult">Adulto</option>
                <option value="child">Criança</option>
              </select>
              <button onClick={addGuest} className="btn-primary py-2 text-sm">
                {t(lang, "addGuest")}
              </button>
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            <input ref={fileRef} type="file" accept=".csv,.txt" onChange={handleImport} className="hidden" />
            <button onClick={() => fileRef.current?.click()} className="btn-secondary flex items-center gap-2 text-sm">
              <Upload className="w-4 h-4" /> {t(lang, "import")}
            </button>
            <button
              onClick={() => setBulkPending(guests.filter((g) => !g.invited))}
              className="btn-whatsapp flex items-center gap-2 text-sm"
            >
              <Send className="w-4 h-4" /> {t(lang, "sendAll")}
            </button>
            <button
              onClick={() => {
                const ok = window.confirm("Limpar toda a lista de convidados?");
                if (!ok) return;
                clearGuests();
                setGuests([]);
                setBulkPending([]);
              }}
              className="btn-secondary flex items-center gap-2 text-sm"
            >
              <Trash2 className="w-4 h-4" /> {t(lang, "clearGuestList")}
            </button>
            <button
              onClick={() => {
                const ok = window.confirm("Limpar apenas os convidados marcados como enviados?");
                if (!ok) return;
                clearInvitedGuests();
                setGuests(getGuests());
                setBulkPending((prev) => prev.filter((g) => !g.invited));
              }}
              className="btn-secondary flex items-center gap-2 text-sm"
            >
              <Trash2 className="w-4 h-4" /> {t(lang, "clearSentGuestList")}
            </button>
          </div>

          {bulkPending.length > 0 && (
            <div className="mb-4 p-3 rounded-xl bg-muted/50">
              <div className="font-semibold font-body mb-2">Envios pendentes ({bulkPending.length})</div>
              <div className="space-y-2">
                {bulkPending.map((g) => (
                  <div key={g.id} className="flex items-center justify-between gap-2">
                    <div className="text-sm">
                      <span className="font-semibold">{g.name}</span>
                      <span className="text-muted-foreground ml-2">{g.phone}</span>
                    </div>
                    <button
                      onClick={() => {
                        sendInvite(g);
                        setBulkPending((prev) => prev.filter((x) => x.id !== g.id));
                      }}
                      className="btn-whatsapp text-xs py-1 px-3"
                    >
                      <Send className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {guests.length > 0 && (
            <div className="space-y-2">
              {guests.map((g) => (
                <div key={g.id} className="flex items-center justify-between py-2 px-3 rounded-xl bg-muted/50">
                  <div>
                    <span className="font-semibold font-body">{g.name}</span>
                    <span className="text-muted-foreground text-sm ml-2">{g.phone}</span>
                    <span className="text-muted-foreground text-xs ml-2">[{g.lang} · {g.category === "child" ? "Criança" : "Adulto"}]</span>
                    {!!(g.people || "").trim() && <span className="text-muted-foreground text-xs ml-2">· {g.people}</span>}
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
