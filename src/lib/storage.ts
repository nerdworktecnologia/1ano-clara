export interface RSVPEntry {
  id: string;
  name: string;
  attending: boolean;
  adults: number;
  children: number;
  phone: string;
  notes: string;
  createdAt: string;
}

export interface GuestEntry {
  id: string;
  name: string;
  phone: string;
  people: string;
  lang: "pt" | "en";
  category: "adult" | "child";
  invited: boolean;
}

const RSVP_KEY = "rsvp_entries";
const GUESTS_KEY = "guest_list";
const RSVP_COLLECTION = "rsvps";

function generateId() {
  const c = globalThis.crypto as Crypto | undefined;
  if (c?.randomUUID) return c.randomUUID();

  if (c?.getRandomValues) {
    const bytes = new Uint8Array(16);
    c.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function safeGet<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    if (!data) return fallback;
    return JSON.parse(data) as T;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

async function trySaveRSVPToCloud(entry: RSVPEntry) {
  try {
    const [{ firestoreDb }, { doc, setDoc }] = await Promise.all([
      import("@/lib/firebase"),
      import("firebase/firestore"),
    ]);
    await setDoc(doc(firestoreDb, RSVP_COLLECTION, entry.id), entry, { merge: false });
    return true;
  } catch {
    return false;
  }
}

export async function loadRSVPs(): Promise<RSVPEntry[]> {
  try {
    const [{ firestoreDb }, { collection, getDocs }] = await Promise.all([
      import("@/lib/firebase"),
      import("firebase/firestore"),
    ]);
    const snap = await getDocs(collection(firestoreDb, RSVP_COLLECTION));
    const entries = snap.docs
      .map((d) => d.data() as RSVPEntry)
      .filter((e) => e && typeof e.id === "string")
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    safeSet(RSVP_KEY, entries);
    return entries;
  } catch {
    return getRSVPs();
  }
}

export function saveRSVP(entry: Omit<RSVPEntry, "id" | "createdAt">): RSVPEntry {
  const entries = getRSVPs();
  const newEntry: RSVPEntry = {
    ...entry,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  entries.push(newEntry);
  const localOk = safeSet(RSVP_KEY, entries);
  void trySaveRSVPToCloud(newEntry);
  if (!localOk) throw new Error("RSVP_SAVE_FAILED");
  return newEntry;
}

export function getRSVPs(): RSVPEntry[] {
  return safeGet<RSVPEntry[]>(RSVP_KEY, []);
}

export function updateRSVP(
  id: string,
  patch: Partial<Omit<RSVPEntry, "id" | "createdAt">>,
): RSVPEntry | undefined {
  const entries = getRSVPs();
  const idx = entries.findIndex((e) => e.id === id);
  if (idx === -1) return;
  const updated: RSVPEntry = { ...entries[idx], ...patch };
  entries[idx] = updated;
  safeSet(RSVP_KEY, entries);
  void trySaveRSVPToCloud(updated);
  return updated;
}

export function deleteRSVP(id: string) {
  const entries = getRSVPs();
  const next = entries.filter((e) => e.id !== id);
  safeSet(RSVP_KEY, next);
  void (async () => {
    try {
      const [{ firestoreDb }, { deleteDoc, doc }] = await Promise.all([
        import("@/lib/firebase"),
        import("firebase/firestore"),
      ]);
      await deleteDoc(doc(firestoreDb, RSVP_COLLECTION, id));
    } catch {
      return;
    }
  })();
}

export function getGuests(): GuestEntry[] {
  const list = safeGet<unknown[]>(GUESTS_KEY, []);
  return list.map((g) => {
    const obj: Record<string, unknown> = typeof g === "object" && g !== null ? (g as Record<string, unknown>) : {};
    const id = typeof obj.id === "string" ? obj.id : generateId();
    const name = typeof obj.name === "string" ? obj.name : "";
    const phone = typeof obj.phone === "string" ? obj.phone : "";
    const people = typeof obj.people === "string" ? obj.people : "";
    const lang = obj.lang === "en" ? "en" : "pt";
    const category = obj.category === "child" ? "child" : "adult";
    const invited = !!obj.invited;
    return { id, name, phone, people, lang, category, invited };
  });
}

export function saveGuest(entry: Omit<GuestEntry, "id" | "invited">): GuestEntry {
  const guests = getGuests();
  const newGuest: GuestEntry = { ...entry, id: generateId(), invited: false };
  guests.push(newGuest);
  safeSet(GUESTS_KEY, guests);
  return newGuest;
}

export function importGuests(list: { name: string; phone: string; people?: string; lang?: string; category?: string }[]) {
  const guests = getGuests();
  const newGuests = list.map((g) => ({
    id: generateId(),
    name: g.name,
    phone: g.phone,
    people: g.people || "",
    lang: g.lang === "en" ? "en" : "pt",
    category: g.category === "child" ? "child" : "adult",
    invited: false,
  }));
  safeSet(GUESTS_KEY, [...guests, ...newGuests]);
}

export function markInvited(id: string) {
  const guests = getGuests();
  const idx = guests.findIndex((g) => g.id === id);
  if (idx !== -1) {
    guests[idx].invited = true;
    safeSet(GUESTS_KEY, guests);
  }
}

export function clearGuests() {
  try {
    localStorage.removeItem(GUESTS_KEY);
  } catch {
    return;
  }
}

export function clearInvitedGuests() {
  const guests = getGuests();
  const next = guests.filter((g) => !g.invited);
  safeSet(GUESTS_KEY, next);
}

export function deleteGuest(id: string) {
  const guests = getGuests();
  const next = guests.filter((g) => g.id !== id);
  safeSet(GUESTS_KEY, next);
}
