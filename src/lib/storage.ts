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
  invited: boolean;
}

const RSVP_KEY = "rsvp_entries";
const GUESTS_KEY = "guest_list";

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
  } catch {
    return;
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
  safeSet(RSVP_KEY, entries);
  return newEntry;
}

export function getRSVPs(): RSVPEntry[] {
  return safeGet<RSVPEntry[]>(RSVP_KEY, []);
}

export function getGuests(): GuestEntry[] {
  return safeGet<GuestEntry[]>(GUESTS_KEY, []);
}

export function saveGuest(entry: Omit<GuestEntry, "id" | "invited">): GuestEntry {
  const guests = getGuests();
  const newGuest: GuestEntry = { ...entry, id: generateId(), invited: false };
  guests.push(newGuest);
  safeSet(GUESTS_KEY, guests);
  return newGuest;
}

export function importGuests(list: { name: string; phone: string }[]) {
  const guests = getGuests();
  const newGuests = list.map((g) => ({
    ...g,
    id: generateId(),
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
