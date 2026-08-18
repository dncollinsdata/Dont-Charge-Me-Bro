import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState } from "react-native";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { getPermission, syncRoasts, type SyncResult } from "./lib/notify";
import {
  addWasted,
  advance,
  defaultPrefs,
  monthlyCost,
  streakDays,
  toRows,
  todayISO,
  type Prefs,
  type Row,
  type Sub,
  type WastedEntry,
} from "./lib/trials";

const KEYS = {
  subs: "dontcharge.subs.v1",
  wasted: "dontcharge.wasted.v1",
  prefs: "dontcharge.prefs.v1",
} as const;

type Store = {
  hydrated: boolean;
  subs: Sub[];
  wasted: WastedEntry[];
  prefs: Prefs;
  rows: Row[];
  panic: Row | null;
  monthly: number;
  wastedTotal: number;
  streak: number;
  toast: string | null;
  /** What the last schedule rebuild managed to arm. Null until one has run. */
  coverage: SyncResult | null;
  /** Rebuild the schedule now — for when permission has just been granted. */
  resyncRoasts: () => void;
  showToast: (message: string) => void;
  addSub: (sub: Sub) => void;
  yeet: (row: Row) => void;
  letItCharge: (row: Row) => void;
  setRoast: (roast: Prefs["roast"]) => void;
  dismissOnboarding: () => void;
};

const StoreContext = createContext<Store | null>(null);

async function readJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown) {
  AsyncStorage.setItem(key, JSON.stringify(value)).catch(() => {
    /* a dropped write is not worth crashing over */
  });
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [subs, setSubs] = useState<Sub[]>([]);
  const [wasted, setWasted] = useState<WastedEntry[]>([]);
  const [prefs, setPrefs] = useState<Prefs>(defaultPrefs);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [coverage, setCoverage] = useState<SyncResult | null>(null);
  const lastSyncDay = useRef<string | null>(null);

  useEffect(() => {
    (async () => {
      const [storedSubs, storedWasted, storedPrefs] = await Promise.all([
        readJSON<Sub[]>(KEYS.subs, []),
        readJSON<WastedEntry[]>(KEYS.wasted, []),
        readJSON<Partial<Prefs>>(KEYS.prefs, {}),
      ]);
      setSubs(storedSubs);
      setWasted(storedWasted);
      setPrefs({ ...defaultPrefs(), ...storedPrefs });
      setHydrated(true);
    })();
  }, []);

  useEffect(() => {
    if (hydrated) writeJSON(KEYS.subs, subs);
  }, [subs, hydrated]);
  useEffect(() => {
    if (hydrated) writeJSON(KEYS.wasted, wasted);
  }, [wasted, hydrated]);
  useEffect(() => {
    if (hydrated) writeJSON(KEYS.prefs, prefs);
  }, [prefs, hydrated]);

  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    [],
  );

  const rows = useMemo(() => toRows(subs), [subs]);

  const resync = useCallback(() => {
    getPermission().then((status) => {
      if (status !== "granted") return;
      lastSyncDay.current = todayISO();
      syncRoasts(subs, prefs.roast).then(setCoverage);
    });
  }, [subs, prefs.roast]);

  // Any change to what's tracked, or to how mean we are, rebuilds the schedule.
  useEffect(() => {
    if (hydrated) resync();
  }, [hydrated, resync]);

  /**
   * Coverage is finite, so every app open is a chance to top it up. Once a day
   * is enough: rescheduling sixty notifications every time the app is flicked
   * to would be churn, but a day that ends without a resync is a day of the
   * schedule quietly expiring.
   */
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state !== "active" || !hydrated) return;
      if (lastSyncDay.current === todayISO()) return;
      resync();
    });
    return () => subscription.remove();
  }, [hydrated, resync]);

  const showToast = useCallback((message: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  const value: Store = {
    hydrated,
    subs,
    wasted,
    prefs,
    rows,
    panic: rows.find((r) => r.days <= 0) ?? null,
    monthly: subs.reduce((sum, s) => sum + monthlyCost(s), 0),
    wastedTotal: wasted.reduce((sum, w) => sum + w.amount, 0),
    streak: streakDays(prefs.streakSince),
    toast,
    coverage,
    resyncRoasts: resync,
    showToast,
    addSub: (sub) => setSubs((prev) => [...prev, sub]),
    yeet: (row) => {
      setPrefs((p) => ({
        ...p,
        wins: p.wins + 1,
        closestCall: p.closestCall === null ? row.days : Math.min(p.closestCall, row.days),
      }));
      setSubs((prev) => prev.filter((s) => s.id !== row.sub.id));
    },
    letItCharge: (row) => {
      setWasted((prev) => addWasted(prev, row.sub));
      setSubs((prev) => prev.map((s) => (s.id === row.sub.id ? advance(s) : s)));
      setPrefs((p) => ({ ...p, streakSince: todayISO() }));
    },
    setRoast: (roast) => setPrefs((p) => ({ ...p, roast })),
    dismissOnboarding: () => setPrefs((p) => ({ ...p, onboarded: true })),
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useStore must be used inside <StoreProvider>");
  return store;
}
