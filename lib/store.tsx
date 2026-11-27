/**
 * Store — the logbook's local data layer.
 *
 * Local-only (Nov 27, 2026: accounts and cloud sync removed at Joey's
 * direction): entries, aircraft, and qualifications live in AsyncStorage
 * on this device and work fully offline. There is no backend.
 * There is NO seed/demo data on any platform (removed Nov 27, 2026 at
 * Joey's direction): a fresh install starts with a completely empty
 * logbook, and only flights the user adds are ever shown.
 *
 * Free tier: FREE_ENTRY_LIMIT entries (Pro removes the cap — see lib/pro.ts).
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  newEntryId,
  newId,
  type Aircraft,
  type LogbookEntry,
  type Qualification,
} from "./types";

const ENTRIES_KEY = "flightjournal:entries:v1";
const AIRCRAFT_KEY = "flightjournal:aircraft:v1";
const QUALS_KEY = "flightjournal:quals:v1";

async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Best-effort.
  }
}

export interface LogbookStore {
  loaded: boolean;
  entries: LogbookEntry[];
  aircraft: Aircraft[];
  qualifications: Qualification[];
  addEntry: (e: Omit<LogbookEntry, "id" | "createdAt" | "updatedAt">) => Promise<LogbookEntry>;
  updateEntry: (id: string, patch: Partial<LogbookEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  addAircraft: (a: Omit<Aircraft, "id">) => Promise<Aircraft>;
  updateAircraft: (id: string, patch: Partial<Aircraft>) => Promise<void>;
  deleteAircraft: (id: string) => Promise<void>;
  addQualification: (q: Omit<Qualification, "id">) => Promise<Qualification>;
  updateQualification: (id: string, patch: Partial<Qualification>) => Promise<void>;
  deleteQualification: (id: string) => Promise<void>;
}

const Ctx = createContext<LogbookStore | null>(null);

export function LogbookProvider({ children }: { children: ReactNode }) {
  const [loaded, setLoaded] = useState(false);
  const [entries, setEntries] = useState<LogbookEntry[]>([]);
  const [aircraft, setAircraft] = useState<Aircraft[]>([]);
  const [qualifications, setQualifications] = useState<Qualification[]>([]);

  useEffect(() => {
    (async () => {
      const [e, a, q] = await Promise.all([
        readJson<LogbookEntry[]>(ENTRIES_KEY, []),
        readJson<Aircraft[]>(AIRCRAFT_KEY, []),
        readJson<Qualification[]>(QUALS_KEY, []),
      ]);
      // No seeding, ever: whatever is stored is what the user added.
      // Fresh storage means a completely empty logbook.
      setEntries(e);
      setAircraft(a);
      setQualifications(q);
      setLoaded(true);
    })();
  }, []);

  const persist = useCallback(
    async (next: {
      entries?: LogbookEntry[];
      aircraft?: Aircraft[];
      qualifications?: Qualification[];
    }) => {
      await Promise.all([
        next.entries ? writeJson(ENTRIES_KEY, next.entries) : Promise.resolve(),
        next.aircraft ? writeJson(AIRCRAFT_KEY, next.aircraft) : Promise.resolve(),
        next.qualifications
          ? writeJson(QUALS_KEY, next.qualifications)
          : Promise.resolve(),
      ]);
    },
    [],
  );

  const addEntry = useCallback(
    async (e: Omit<LogbookEntry, "id" | "createdAt" | "updatedAt">) => {
      const now = new Date().toISOString();
      const full: LogbookEntry = { ...e, id: newEntryId(), createdAt: now, updatedAt: now };
      const next = [...entries, full].sort((a, b) => b.date.localeCompare(a.date));
      setEntries(next);
      await persist({ entries: next });
      return full;
    },
    [entries, persist],
  );

  const updateEntry = useCallback(
    async (id: string, patch: Partial<LogbookEntry>) => {
      const next = entries.map((e) =>
        e.id === id ? { ...e, ...patch, updatedAt: new Date().toISOString() } : e,
      );
      setEntries(next);
      await persist({ entries: next });
    },
    [entries, persist],
  );

  const deleteEntry = useCallback(
    async (id: string) => {
      const next = entries.filter((e) => e.id !== id);
      setEntries(next);
      await persist({ entries: next });
    },
    [entries, persist],
  );

  const addAircraft = useCallback(
    async (a: Omit<Aircraft, "id">) => {
      const full: Aircraft = { ...a, id: newId("ac") };
      const next = [...aircraft, full];
      setAircraft(next);
      await persist({ aircraft: next });
      return full;
    },
    [aircraft, persist],
  );

  const updateAircraft = useCallback(
    async (id: string, patch: Partial<Aircraft>) => {
      const next = aircraft.map((a) => (a.id === id ? { ...a, ...patch } : a));
      setAircraft(next);
      await persist({ aircraft: next });
    },
    [aircraft, persist],
  );

  const deleteAircraft = useCallback(
    async (id: string) => {
      const next = aircraft.filter((a) => a.id !== id);
      setAircraft(next);
      await persist({ aircraft: next });
    },
    [aircraft, persist],
  );

  const addQualification = useCallback(
    async (q: Omit<Qualification, "id">) => {
      const full: Qualification = { ...q, id: newId("q") };
      const next = [...qualifications, full];
      setQualifications(next);
      await persist({ qualifications: next });
      return full;
    },
    [qualifications, persist],
  );

  const updateQualification = useCallback(
    async (id: string, patch: Partial<Qualification>) => {
      const next = qualifications.map((q) => (q.id === id ? { ...q, ...patch } : q));
      setQualifications(next);
      await persist({ qualifications: next });
    },
    [qualifications, persist],
  );

  const deleteQualification = useCallback(
    async (id: string) => {
      const next = qualifications.filter((q) => q.id !== id);
      setQualifications(next);
      await persist({ qualifications: next });
    },
    [qualifications, persist],
  );

  const value = useMemo<LogbookStore>(
    () => ({
      loaded,
      entries,
      aircraft,
      qualifications,
      addEntry,
      updateEntry,
      deleteEntry,
      addAircraft,
      updateAircraft,
      deleteAircraft,
      addQualification,
      updateQualification,
      deleteQualification,
    }),
    [
      loaded, entries, aircraft, qualifications, addEntry, updateEntry,
      deleteEntry, addAircraft, updateAircraft, deleteAircraft,
      addQualification, updateQualification, deleteQualification,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLogbook(): LogbookStore {
  const v = useContext(Ctx);
  if (!v) throw new Error("useLogbook must be used inside LogbookProvider");
  return v;
}
