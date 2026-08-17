import { money, ranForLabel, type WastedEntry } from "@/lib/trials";
import { Btn } from "./ui";

export type Medal = {
  emoji: string;
  title: string;
  body: string;
  locked: boolean;
};

export function Shame({
  wasted,
  wastedTotal,
  medals,
  onReceipt,
}: {
  wasted: WastedEntry[];
  wastedTotal: number;
  medals: Medal[];
  onReceipt: () => void;
}) {
  const ranked = [...wasted].sort((a, b) => b.amount - a.amount);

  return (
    <div className="flex-1 overflow-y-auto px-4.5 screen-top pb-5">
      <h1 className="mb-1 -rotate-1 font-display text-[26px] [text-shadow:3px_3px_0_#fff]">
        HALL OF SHAME 💀
      </h1>
      <p className="mb-3 text-[13px] font-extrabold text-bro-steel">
        money donated to companies bro forgot about:
      </p>

      <div className="mb-4 -rotate-1 rounded-[18px] border-[3px] border-bro-ink bg-bro-yellow p-3.5 text-center shadow-hard-md">
        <div className="numeric font-display text-[44px] leading-none">
          {money(Math.round(wastedTotal))}
        </div>
        <div className="mt-1 text-[11px] font-black">
          lifetime figure. it does NOT get better. 😭
        </div>
      </div>

      <h2 className="mb-2.5 font-display text-[15px]">TOP DONATIONS 🏆</h2>
      <div className="mb-4.5 flex flex-col gap-2">
        {ranked.map((w, i) => (
          <div
            key={w.id}
            className="flex items-center gap-2.5 rounded-[14px] border-[3px] border-bro-ink bg-white px-3 py-2.5 font-extrabold shadow-hard"
          >
            <div className="w-6 flex-none text-center font-display text-base">
              {i + 1}
            </div>
            <div className="min-w-0 flex-1 truncate text-[13px]">
              {w.name}{" "}
              <span className="text-[11px] text-neutral-500">
                ({ranForLabel(w)})
              </span>
            </div>
            <div className="numeric font-display text-sm">
              {money(w.amount)}
            </div>
          </div>
        ))}

        {ranked.length === 0 && (
          <p className="rounded-[14px] border-[3px] border-dashed border-bro-ink bg-white p-5 text-center text-[13px] font-black">
            clean record so far 😇 let one charge slip and it lands here
            forever.
          </p>
        )}
      </div>

      <h2 className="mb-2.5 font-display text-[15px]">STICKER BOOK 🎖️</h2>
      <div className="mb-4.5 grid grid-cols-2 gap-2.5">
        {medals.map((m) => (
          <div
            key={m.title}
            className={`rounded-[14px] border-[3px] border-bro-ink px-3 py-2.5 shadow-hard ${
              m.locked ? "bg-bro-locked opacity-55" : "bg-white"
            }`}
          >
            <div className="text-2xl" aria-hidden="true">
              {m.locked ? "🔒" : m.emoji}
            </div>
            <div className="mt-1 font-display text-[13px]">{m.title}</div>
            <div className="mt-0.5 text-[11px] font-extrabold text-neutral-700">
              {m.body}
            </div>
          </div>
        ))}
      </div>

      <div
        className="mb-1.5 flex h-[190px] rotate-1 items-center justify-center gap-1 overflow-hidden rounded-[18px] border-[3px] border-bro-ink bg-[linear-gradient(160deg,#ffe14d_0%,#ff9ecb_60%,#ff2f8e_100%)] shadow-hard"
        aria-hidden="true"
      >
        <span className="text-[64px] drop-shadow-[3px_3px_0_#111]">😭</span>
        <span className="text-[44px] drop-shadow-[3px_3px_0_#111]">📱</span>
        <span className="text-[64px] drop-shadow-[3px_3px_0_#111]">💸</span>
      </div>
      <p className="mb-4 text-center text-[11px] font-extrabold text-bro-steel">
        live footage of bro checking his statement
      </p>

      <Btn
        tone="white"
        onClick={onReceipt}
        className="w-full p-3 font-display text-[15px]"
      >
        PRINT THE RECEIPT 🧾
      </Btn>
    </div>
  );
}
