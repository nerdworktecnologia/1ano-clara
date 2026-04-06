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

export function saveRSVP(entry: Omit<RSVPEntry, "id" | "createdAt">): RSVPEntry {
  const entries = getRSVPs();
  const newEntry: RSVPEntry = {
    ...entry,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  entries.push(newEntry);
  localStorage.setItem(RSVP_KEY, JSON.stringify(entries));
  return newEntry;
}

export function getRSVPs(): RSVPEntry[] {
  const data = localStorage.getItem(RSVP_KEY);
  return data ? JSON.parse(data) : [];
}

export function getGuests(): GuestEntry[] {
  const data = localStorage.getItem(GUESTS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveGuest(entry: Omit<GuestEntry, "id" | "invited">): GuestEntry {
  const guests = getGuests();
  const newGuest: GuestEntry = { ...entry, id: crypto.randomUUID(), invited: false };
  guests.push(newGuest);
  localStorage.setItem(GUESTS_KEY, JSON.stringify(guests));
  return newGuest;
}

export function importGuests(list: { name: string; phone: string }[]) {
  const guests = getGuests();
  const newGuests = list.map((g) => ({
    ...g,
    id: crypto.randomUUID(),
    invited: false,
  }));
  localStorage.setItem(GUESTS_KEY, JSON.stringify([...guests, ...newGuests]));
}

export function markInvited(id: string) {
  const guests = getGuests();
  const idx = guests.findIndex((g) => g.id === id);
  if (idx !== -1) {
    guests[idx].invited = true;
    localStorage.setItem(GUESTS_KEY, JSON.stringify(guests));
  }
}
