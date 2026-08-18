import { useState } from "react";
import { plusDays, type Cycle, type Sub } from "@/lib/trials";
import { Btn, Field, FieldLabel, Heading, Segmented } from "./ui";

const CYCLES: { value: Cycle; label: string }[] = [
  { value: "trial", label: "free trial" },
  { value: "monthly", label: "monthly" },
  { value: "yearly", label: "yearly" },
];

export function AddLeech({
  onBack,
  onAdd,
}: {
  onBack: () => void;
  onAdd: (sub: Sub) => void;
}) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [cycle, setCycle] = useState<Cycle>("trial");
  const [date, setDate] = useState(plusDays(7));

  const valid = name.trim().length > 0 && Boolean(date);

  return (
    <form
      className="flex-1 overflow-y-auto px-5 screen-top pb-5"
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
      <button
        type="button"
        onClick={onBack}
        className="cursor-pointer text-[13px] font-black text-bro-steel hover:text-bro-pink"
      >
        ← back
      </button>

      <Heading className="mt-2 mb-1 -rotate-1">ADD A LEECH ➕</Heading>
      <p className="mb-4 text-[13px] font-extrabold text-bro-steel">
        5 seconds. that&apos;s it. future you says ty 🙏
      </p>

      <div className="flex flex-col gap-3.5">
        <label className="block">
          <FieldLabel>WHO&apos;S COMING FOR THE BAG 💰</FieldLabel>
          <Field
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="streaming service, gym, AI girlfriend…"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <FieldLabel>HOW MUCH 💸</FieldLabel>
            <Field
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="9.99"
            />
          </label>
          <label className="block">
            <FieldLabel>
              {cycle === "trial" ? "TRIAL ENDS 📅" : "NEXT CHARGE 📅"}
            </FieldLabel>
            <Field
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="text-sm"
            />
          </label>
        </div>

        <div>
          <FieldLabel>WHAT KIND OF TRAP 🪤</FieldLabel>
          <Segmented
            label="Billing cycle"
            value={cycle}
            options={CYCLES}
            onPick={setCycle}
          />
        </div>

        {cycle === "trial" && (
          <div className="flex flex-wrap gap-2">
            {[3, 7, 14, 30].map((d) => (
              <Btn
                key={d}
                tone="yellow"
                onClick={() => setDate(plusDays(d))}
                className="px-3.5 py-1.5 text-xs font-black shadow-hard-sm"
              >
                {d}-day
              </Btn>
            ))}
          </div>
        )}

        <Btn
          type="submit"
          disabled={!valid}
          className="mt-1 p-3.5 font-display text-[17px]"
        >
          TRACK IT BESTIE ✅
        </Btn>
      </div>
    </form>
  );
}
