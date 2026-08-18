import { dueText, money, type Row } from "@/lib/trials";
import { chipColor } from "@/lib/chips";

export function Home({
  rows,
  panic,
  monthly,
  streak,
  onOpenPanic,
  onYeet,
}: {
  rows: Row[];
  panic: Row | null;
  monthly: number;
  streak: number;
  onOpenPanic: () => void;
  onYeet: (row: Row) => void;
}) {
  return (
    <div className="flex-1 overflow-y-auto px-4.5 screen-top pb-5">
      <div className="relative mb-3">
        <h1 className="font-display text-[28px] leading-none -rotate-2 [text-shadow:3px_3px_0_#fff]">
          DON&apos;T CHARGE
          <br />
          <span className="text-bro-pink">ME BRO!!</span>
        </h1>
        {panic && (
          <div className="wobble absolute -top-1.5 right-0 rotate-[8deg] rounded-full border-[3px] border-bro-ink bg-bro-yellow px-3 py-2 text-center text-[11px] font-black shadow-hard">
            SCAM
            <br />
            ALERT!
          </div>
        )}
      </div>

      {panic && (
        <div className="mb-3.5 -rotate-1">
          <button
            type="button"
            onClick={onOpenPanic}
            className="press w-full cursor-pointer rounded-[18px] border-[3px] border-bro-ink bg-bro-pink p-3.5 text-left text-white shadow-hard-md"
          >
            <div className="font-display text-[17px]">
              😱 {panic.sub.name.toUpperCase()} CHARGES TODAY
            </div>
            <div className="mt-1 text-[13px] font-extrabold">
              {money(panic.sub.amount)} about to leave the chat. NOT on our
              watch bestie.
            </div>
            <div className="mt-2.5 inline-block rounded-full border-[3px] border-bro-ink bg-white px-4 py-1.5 text-[13px] font-black text-bro-ink shadow-hard-sm">
              HANDLE IT RN →
            </div>
          </button>
        </div>
      )}

      <div className="mb-3.5 flex gap-2.5">
        <div className="flex-1 rounded-2xl border-[3px] border-bro-ink bg-white px-3 py-2.5 shadow-hard">
          <div className="text-[10px] font-black tracking-[0.06em] text-neutral-500">
            DRAIN / MO
          </div>
          <div className="numeric font-display text-2xl">
            {money(Math.round(monthly))}
          </div>
        </div>
        <div className="flex-1 rotate-1 rounded-2xl border-[3px] border-bro-ink bg-bro-lime px-3 py-2.5 shadow-hard">
          <div className="text-[10px] font-black tracking-[0.06em]">
            W STREAK 🔥
          </div>
          <div className="numeric font-display text-2xl">{streak} days</div>
        </div>
      </div>

      <h2 className="mb-2.5 -rotate-1 font-display text-[15px]">
        THE LEECHES 🩸
      </h2>

      <div className="flex flex-col gap-2.5">
        {rows.map((row, i) => (
          <div
            key={row.sub.id}
            className="flex items-center gap-2.5 rounded-[14px] border-[3px] border-bro-ink bg-white px-3 py-2.5 shadow-hard"
          >
            <div
              className="flex size-9 flex-none items-center justify-center rounded-[10px] border-[3px] border-bro-ink font-display text-base"
              style={{ background: chipColor(i) }}
              aria-hidden="true"
            >
              {row.sub.name[0]?.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-extrabold">
                {row.sub.name}
              </div>
              <div
                className={`text-[11px] font-extrabold ${
                  row.days <= 1 ? "text-bro-pink-deep" : "text-neutral-600"
                }`}
              >
                {dueText(row.days)} · {money(row.sub.amount)}
                {row.sub.cycle === "trial"
                  ? " · free trial trap"
                  : row.sub.cycle === "monthly"
                    ? "/mo"
                    : "/yr"}
              </div>
            </div>
            <button
              type="button"
              onClick={() => onYeet(row)}
              aria-label={`Yeet ${row.sub.name}`}
              className="cursor-pointer rounded-full bg-bro-ink px-3 py-1.5 text-[11px] font-black text-white transition-colors hover:bg-bro-pink"
            >
              YEET
            </button>
          </div>
        ))}

        {rows.length === 0 && (
          <p className="rounded-[14px] border-[3px] border-dashed border-bro-ink bg-white p-5 text-center text-[13px] font-black">
            no leeches?? 🥹 bro is FREE. add one when they come back.
          </p>
        )}
      </div>
    </div>
  );
}
