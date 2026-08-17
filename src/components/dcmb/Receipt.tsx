import { money, ranForLabel, type WastedEntry } from "@/lib/trials";
import { Btn } from "./ui";

export function Receipt({
  wasted,
  wastedTotal,
  onBack,
  onShare,
}: {
  wasted: WastedEntry[];
  wastedTotal: number;
  onBack: () => void;
  onShare: () => void;
}) {
  const dateline = new Date().toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="flex-1 overflow-y-auto px-5 screen-top pb-5">
      <button
        type="button"
        onClick={onBack}
        className="cursor-pointer text-[13px] font-black text-bro-steel hover:text-bro-pink"
      >
        ← hall of shame
      </button>

      <div className="my-3 -rotate-1 rounded-md border-[3px] border-bro-ink bg-white px-4.5 py-5.5 shadow-hard-lg">
        <div className="mb-3 border-b-[3px] border-dashed border-bro-ink pb-3 text-center">
          <div className="font-display text-[19px]">OFFICIAL L RECEIPT 🧾</div>
          <div className="mt-1 text-[10px] font-black tracking-[0.08em] text-neutral-500">
            DON&apos;T CHARGE ME BRO · {dateline}
          </div>
        </div>

        {wasted.map((w) => (
          <div
            key={w.id}
            className="flex justify-between gap-3 py-1 text-[13px] font-extrabold"
          >
            <span className="min-w-0 truncate">
              {w.name}{" "}
              <span className="text-[11px] text-neutral-400">
                ({ranForLabel(w)})
              </span>
            </span>
            <span className="numeric flex-none">{money(w.amount)}</span>
          </div>
        ))}

        {wasted.length === 0 && (
          <p className="py-2 text-center text-[13px] font-extrabold text-neutral-500">
            nothing to declare. suspiciously clean. 🧼
          </p>
        )}

        <div className="mt-2.5 flex justify-between border-t-[3px] border-dashed border-bro-ink pt-2.5 font-display text-base">
          <span>TOTAL SHAME</span>
          <span className="numeric">{money(Math.round(wastedTotal))}</span>
        </div>

        <div
          className="my-4 h-9 bg-[repeating-linear-gradient(90deg,#111_0_2px,transparent_2px_5px,#111_5px_6px,transparent_6px_10px)]"
          aria-hidden="true"
        />
        <p className="text-center text-[10px] font-extrabold text-neutral-500">
          keep for your records. or don&apos;t. you won&apos;t. 🫡
        </p>
      </div>

      <Btn
        tone="pink"
        onClick={onShare}
        className="w-full p-3.5 font-display text-base"
      >
        SHARE THIS L 📤
      </Btn>
    </div>
  );
}
