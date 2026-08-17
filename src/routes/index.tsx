import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, ShieldCheck, X, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  type Cycle,
  type Sub,
  countdownLabel,
  daysUntil,
  formatDate,
  loadSubs,
  money,
  monthlyCost,
  nextDate,
  saveSubs,
  todayISO,
} from "@/lib/trials";
import {
  notificationPermission,
  notifyExpiring,
  requestNotifications,
} from "@/lib/notify";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Don't Charge Me — Free Trial & Subscription Reminder" },
      {
        name: "description",
        content:
          "Add a free trial in 5 seconds and see exactly when it turns into a charge. No account, no card, nothing leaves your phone.",
      },
      { property: "og:title", content: "Don't Charge Me — Never get billed by surprise" },
      {
        property: "og:description",
        content:
          "The dead-simple tracker for free trials and subscriptions. See what bills next, cancel before it hits.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const CYCLES: { value: Cycle; label: string }[] = [
  { value: "trial", label: "Free trial" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

function plusDays(n: number) {
  const d = new Date(todayISO() + "T00:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function Index() {
  const [subs, setSubs] = useState<Sub[]>([]);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [perm, setPerm] = useState<NotificationPermission | "unsupported">("unsupported");

  useEffect(() => {
    setSubs(loadSubs());
    setReady(true);
    setPerm(notificationPermission());
  }, []);

  useEffect(() => {
    if (ready) saveSubs(subs);
  }, [subs, ready]);

  const rows = useMemo(
    () =>
      subs
        .map((s) => {
          const date = nextDate(s);
          return { sub: s, date, days: daysUntil(date) };
        })
        .sort((a, b) => a.days - b.days),
    [subs],
  );

  useEffect(() => {
    if (!ready || perm !== "granted") return;
    notifyExpiring(
      rows.map((r) => ({ id: r.sub.id, name: r.sub.name, amount: r.sub.amount, days: r.days })),
    );
  }, [rows, ready, perm]);

  const monthly = subs.reduce((sum, s) => sum + monthlyCost(s), 0);
  const soon = rows.filter((r) => r.days <= 3);


  return (
    <main className="mx-auto min-h-screen w-full max-w-lg px-5 pb-32 pt-10">
      <header className="mb-8">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
          <ShieldCheck className="size-3.5" />
          Stays on your device
        </div>
        <h1 className="text-4xl font-bold leading-[1.05]">
          Don&apos;t charge
          <br />
          me.
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Every free trial you forget becomes a subscription you never wanted. Add it here in five
          seconds and always know what bills next.
        </p>
      </header>

      {rows.length > 0 && (
        <section className="mb-6 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border bg-card p-4 shadow-soft">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Per month</div>
            <div className="numeric mt-1 font-display text-2xl font-bold">{money(monthly)}</div>
          </div>
          <div className="rounded-2xl border bg-card p-4 shadow-soft">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Per year</div>
            <div className="numeric mt-1 font-display text-2xl font-bold">{money(monthly * 12)}</div>
          </div>
        </section>
      )}

      {soon.length > 0 && (
        <div className="mb-6 rounded-2xl border border-destructive/30 bg-destructive/10 p-4">
          <p className="text-sm font-semibold text-destructive">
            {soon.length === 1 && soon[0]
              ? `${soon[0].sub.name} charges ${countdownLabel(soon[0].days)}.`
              : `${soon.length} charges land in the next 3 days.`}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Cancel now if you don&apos;t want it.</p>
        </div>
      )}

      {ready && perm === "default" && rows.length > 0 && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border bg-card p-4 shadow-soft">
          <Bell className="size-4 shrink-0 text-muted-foreground" />
          <p className="flex-1 text-sm text-muted-foreground">
            Get an alert when a trial is about to charge you.
          </p>
          <Button
            size="sm"
            onClick={async () => {
              const result = await requestNotifications();
              setPerm(result);
            }}
          >
            Enable
          </Button>
        </div>
      )}


      <section className="space-y-3">
        {ready && rows.length === 0 && (
          <div className="rounded-2xl border border-dashed p-8 text-center">
            <p className="font-display text-lg font-semibold">Nothing tracked yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Start with the trial you signed up for most recently.
            </p>
          </div>
        )}

        {rows.map(({ sub, date, days }) => (
          <article
            key={sub.id}
            className="flex items-center gap-3 rounded-2xl border bg-card p-4 shadow-soft"
          >
            <div
              className={`numeric flex size-14 shrink-0 flex-col items-center justify-center rounded-xl ${
                days <= 3 ? "bg-destructive/15 text-destructive" : "bg-secondary text-secondary-foreground"
              }`}
            >
              <span className="font-display text-lg font-bold leading-none">
                {days < 0 ? "!" : days}
              </span>
              <span className="mt-0.5 text-[10px] uppercase tracking-wide">
                {days === 1 ? "day" : "days"}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate font-semibold">{sub.name}</div>
              <div className="numeric text-sm text-muted-foreground">
                {money(sub.amount)}
                {sub.cycle === "trial"
                  ? " when the trial ends"
                  : sub.cycle === "monthly"
                    ? " / month"
                    : " / year"}
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                {formatDate(date)} · {countdownLabel(days)}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Remove ${sub.name}`}
              onClick={() => setSubs((prev) => prev.filter((s) => s.id !== sub.id))}
            >
              <Trash2 className="size-4" />
            </Button>
          </article>
        ))}
      </section>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-background/85 px-5 py-4 backdrop-blur">
        <div className="mx-auto max-w-lg">
          <Button className="w-full" size="lg" onClick={() => setOpen(true)}>
            <Plus className="size-4" />
            Add a trial or subscription
          </Button>
        </div>
      </div>

      {open && (
        <AddSheet
          onClose={() => setOpen(false)}
          onAdd={(sub) => {
            setSubs((prev) => [...prev, sub]);
            setOpen(false);
          }}
        />
      )}
    </main>
  );
}

function AddSheet({ onClose, onAdd }: { onClose: () => void; onAdd: (s: Sub) => void }) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [cycle, setCycle] = useState<Cycle>("trial");
  const [date, setDate] = useState(plusDays(7));

  const valid = name.trim().length > 0 && date;

  return (
    <div className="fixed inset-0 z-30 flex items-end bg-foreground/40 backdrop-blur-sm">
      <button className="absolute inset-0" aria-label="Close" onClick={onClose} />
      <form
        className="relative w-full rounded-t-3xl border-t bg-card p-5 pb-8 shadow-lift sm:mx-auto sm:max-w-lg sm:rounded-3xl sm:mb-8"
        onSubmit={(e) => {
          e.preventDefault();
          if (!valid) return;
          onAdd({
            id: crypto.randomUUID(),
            name: name.trim(),
            amount: Number(amount) || 0,
            cycle,
            date,
          });
        }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">What are you tracking?</h2>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="size-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              autoFocus
              placeholder="Streaming service, gym, AI tool…"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                inputMode="decimal"
                placeholder="9.99"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="date">
                {cycle === "trial" ? "Trial ends" : "Next charge"}
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Type</Label>
            <div className="grid grid-cols-3 gap-2">
              {CYCLES.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setCycle(c.value)}
                  className={`rounded-xl border px-2 py-2.5 text-sm font-medium transition-colors ${
                    cycle === c.value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "bg-background hover:bg-secondary"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {cycle === "trial" && (
            <div className="flex flex-wrap gap-2">
              {[3, 7, 14, 30].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDate(plusDays(d))}
                  className="rounded-full border px-3 py-1 text-xs font-medium hover:bg-secondary"
                >
                  {d}-day trial
                </button>
              ))}
            </div>
          )}

          <Button type="submit" className="w-full" size="lg" disabled={!valid}>
            Save
          </Button>
        </div>
      </form>
    </div>
  );
}
