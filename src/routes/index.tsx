import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AddLeech } from "@/components/dcmb/AddLeech";
import { Home } from "@/components/dcmb/Home";
import { Onboarding } from "@/components/dcmb/Onboarding";
import { Panic } from "@/components/dcmb/Panic";
import { Receipt } from "@/components/dcmb/Receipt";
import { Roasts } from "@/components/dcmb/Roasts";
import { Shame, type Medal } from "@/components/dcmb/Shame";
import { TabBar, type TabScreen } from "@/components/dcmb/TabBar";
import { Toast } from "@/components/dcmb/Toast";
import {
  addWasted,
  advance,
  daysUntil,
  defaultPrefs,
  loadPrefs,
  loadSubs,
  loadWasted,
  monthlyCost,
  money,
  nextDate,
  savePrefs,
  saveSubs,
  saveWasted,
  streakDays,
  todayISO,
  type Prefs,
  type Row,
  type Sub,
  type WastedEntry,
} from "@/lib/trials";
import {
  notificationPermission,
  notifyExpiring,
  requestNotifications,
} from "@/lib/notify";

type Screen =
  "onboarding" | "home" | "add" | "panic" | "shame" | "receipt" | "notifs";

const TAB_SCREENS: Screen[] = ["home", "add", "shame", "notifs"];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Don't Charge Me Bro — free trial & subscription tracker" },
      {
        name: "description",
        content:
          "Add a free trial in 5 seconds and get roasted before it turns into a charge. No account, no card, nothing leaves your phone.",
      },
      { property: "og:title", content: "Don't Charge Me Bro" },
      {
        property: "og:description",
        content:
          "Track the leeches. Cancel before they bill you. Keep the bag. No account, no card, nothing leaves your phone.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [subs, setSubs] = useState<Sub[]>([]);
  const [wasted, setWasted] = useState<WastedEntry[]>([]);
  const [prefs, setPrefs] = useState<Prefs>(defaultPrefs);
  const [screen, setScreen] = useState<Screen>("home");
  const [toast, setToast] = useState<string | null>(null);
  const [perm, setPerm] = useState<NotificationPermission | "unsupported">(
    "unsupported",
  );
  const [ready, setReady] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const stored = loadPrefs();
    setSubs(loadSubs());
    setWasted(loadWasted());
    setPrefs(stored);
    setScreen(stored.onboarded ? "home" : "onboarding");
    setPerm(notificationPermission());
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) saveSubs(subs);
  }, [subs, ready]);
  useEffect(() => {
    if (ready) saveWasted(wasted);
  }, [wasted, ready]);
  useEffect(() => {
    if (ready) savePrefs(prefs);
  }, [prefs, ready]);

  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    [],
  );

  const showToast = useCallback((message: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  const rows = useMemo<Row[]>(
    () =>
      subs
        .map((sub) => {
          const date = nextDate(sub);
          return { sub, date, days: daysUntil(date) };
        })
        .sort((a, b) => a.days - b.days),
    [subs],
  );

  const panic = rows.find((r) => r.days <= 0) ?? null;
  const monthly = subs.reduce((sum, s) => sum + monthlyCost(s), 0);
  const wastedTotal = wasted.reduce((sum, w) => sum + w.amount, 0);
  const streak = streakDays(prefs.streakSince);

  useEffect(() => {
    if (!ready || perm !== "granted") return;
    notifyExpiring(
      rows.map((r) => ({
        id: r.sub.id,
        name: r.sub.name,
        amount: r.sub.amount,
        days: r.days,
      })),
      prefs.roast,
    );
  }, [rows, ready, perm, prefs.roast]);

  const medals: Medal[] = [
    {
      emoji: "🩸",
      title: "FIRST BLOOD",
      body: "cancelled his first trial. a nation wept.",
      locked: prefs.wins < 1,
    },
    {
      emoji: "✂️",
      title: "SERIAL YEETER",
      body: "ten confirmed Ws. companies fear him.",
      locked: prefs.wins < 10,
    },
    {
      emoji: "🔥",
      title: "CLOSE CALL",
      body: "cancelled with 0 days left. absolute cinema.",
      locked: prefs.closestCall === null || prefs.closestCall > 0,
    },
    {
      emoji: "🏅",
      title: "FLAWLESS MONTH",
      body: "30 days, zero charges. locked. for now.",
      locked: streak < 30,
    },
  ];

  /** A cancel is a win: bank it for the sticker book, then drop the leech. */
  function recordWin(row: Row) {
    setPrefs((p) => ({
      ...p,
      wins: p.wins + 1,
      closestCall:
        p.closestCall === null ? row.days : Math.min(p.closestCall, row.days),
    }));
    setSubs((prev) => prev.filter((s) => s.id !== row.sub.id));
  }

  function letItCharge(row: Row) {
    setWasted((prev) => addWasted(prev, row.sub));
    setSubs((prev) => prev.map((s) => (s.id === row.sub.id ? advance(s) : s)));
    setPrefs((p) => ({ ...p, streakSince: todayISO() }));
  }

  async function shareShame() {
    const text = `I have donated ${money(Math.round(wastedTotal))} to companies I forgot about. Don't Charge Me Bro 🧾`;
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ text });
        return;
      }
      await navigator.clipboard.writeText(text);
      showToast("copied 📋 go be honest somewhere");
    } catch {
      showToast("couldn't share that L 😔");
    }
  }

  return (
    <main className="flex min-h-dvh justify-center bg-bro-sky-deep sm:items-center sm:p-6">
      <div className="relative flex h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-bro-sky sm:h-[860px] sm:max-h-[calc(100dvh-3rem)] sm:rounded-[32px] sm:border-4 sm:border-bro-ink sm:shadow-hard-lg">
        {ready && screen === "onboarding" && (
          <Onboarding
            onDismiss={() => {
              setPrefs((p) => ({ ...p, onboarded: true }));
              setScreen("home");
            }}
          />
        )}

        {ready && screen === "home" && (
          <Home
            rows={rows}
            panic={panic}
            monthly={monthly}
            streak={streak}
            onOpenPanic={() => setScreen("panic")}
            onYeet={(row) => {
              recordWin(row);
              showToast("YEETED. one less leech 🔥");
            }}
          />
        )}

        {ready && screen === "add" && (
          <AddLeech
            onBack={() => setScreen("home")}
            onAdd={(sub) => {
              setSubs((prev) => [...prev, sub]);
              setScreen("home");
              showToast("TRACKED ✅ bro is slightly less doomed");
            }}
          />
        )}

        {ready && screen === "panic" && (
          <Panic
            row={panic}
            onCancelled={() => {
              if (panic) recordWin(panic);
              setScreen("home");
              showToast("CERTIFIED W 🏆 the streak lives");
            }}
            onAccepted={() => {
              if (panic) letItCharge(panic);
              setScreen("home");
              showToast("streak: deceased 🪦 rip");
            }}
          />
        )}

        {ready && screen === "shame" && (
          <Shame
            wasted={wasted}
            wastedTotal={wastedTotal}
            medals={medals}
            onReceipt={() => setScreen("receipt")}
          />
        )}

        {ready && screen === "receipt" && (
          <Receipt
            wasted={wasted}
            wastedTotal={wastedTotal}
            onBack={() => setScreen("shame")}
            onShare={shareShame}
          />
        )}

        {ready && screen === "notifs" && (
          <Roasts
            rows={rows}
            roast={prefs.roast}
            onPickRoast={(roast) => setPrefs((p) => ({ ...p, roast }))}
            permission={perm}
            onEnable={async () => {
              const result = await requestNotifications();
              setPerm(result);
              if (result === "granted") showToast("roasts armed 🔥");
            }}
          />
        )}

        {TAB_SCREENS.includes(screen) && (
          <TabBar active={screen} onGo={(tab: TabScreen) => setScreen(tab)} />
        )}

        {toast && <Toast message={toast} />}
      </div>
    </main>
  );
}
