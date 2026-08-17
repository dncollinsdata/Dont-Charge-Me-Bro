import { money, type Row } from "@/lib/trials";
import { Btn } from "./ui";

export function Panic({
  row,
  onCancelled,
  onAccepted,
}: {
  row: Row | null;
  onCancelled: () => void;
  onAccepted: () => void;
}) {
  return (
    <div className="screen-top flex flex-1 flex-col justify-center overflow-y-auto bg-bro-pink px-6 pb-8">
      <div className="wobble-fast text-center text-4xl" aria-hidden="true">
        🚨
      </div>

      <h1 className="pop-in my-3 -rotate-2 text-center font-display text-[44px] leading-none text-white [text-shadow:4px_4px_0_#111]">
        {row ? row.sub.name.toUpperCase() : "NOTHING"}
        <br />
        CHARGES
        <br />
        TODAY 💀
      </h1>

      <p className="mb-6 rotate-1 rounded-[18px] border-[3px] border-bro-ink bg-white p-3.5 text-center text-[15px] leading-relaxed font-extrabold shadow-hard-lg">
        {row
          ? `${money(row.sub.amount)} leaves the account at midnight. the free trial bro SWORE he'd remember?? it's here. this is NOT a drill. this is a DEBIT. 🗣️`
          : "crisis averted. nothing charges today."}
      </p>

      <Btn
        tone="lime"
        onClick={onCancelled}
        className="p-4 font-display text-lg"
      >
        I CANCELLED IT (W) 🏆
      </Btn>

      <button
        type="button"
        onClick={onAccepted}
        className="mt-3.5 cursor-pointer text-center text-[13px] font-black text-white underline hover:text-bro-yellow"
      >
        charge me ig… (L + ratio)
      </button>
    </div>
  );
}
