import { ROAST_LEVELS, roastLine } from "@/lib/roasts";
import type { RoastLevel, Row } from "@/lib/trials";
import { chipColor } from "@/lib/chips";
import { Btn, FieldLabel, Segmented } from "./ui";

export function Roasts({
  rows,
  roast,
  onPickRoast,
  permission,
  onEnable,
}: {
  rows: Row[];
  roast: RoastLevel;
  onPickRoast: (level: RoastLevel) => void;
  permission: NotificationPermission | "unsupported";
  onEnable: () => void;
}) {
  const preview = rows.slice(0, 4);

  return (
    <div className="flex-1 overflow-y-auto px-4.5 screen-top pb-5">
      <h1 className="mb-1 -rotate-1 font-display text-[26px] [text-shadow:3px_3px_0_#fff]">
        THE ROASTS 🔔
      </h1>
      <p className="mb-3.5 text-[13px] font-extrabold text-bro-steel">
        delivered when a charge is 3 days out. bro&apos;s most vulnerable hour.
      </p>

      {permission === "default" && (
        <div className="mb-4 flex items-center gap-3 rounded-[16px] border-[3px] border-bro-ink bg-white p-3 shadow-hard">
          <p className="flex-1 text-[13px] font-extrabold">
            let us into your notifications so the roasts actually land 📲
          </p>
          <Btn
            tone="pink"
            onClick={onEnable}
            className="flex-none px-4 py-2 text-xs font-black shadow-hard-sm"
          >
            ALLOW
          </Btn>
        </div>
      )}

      {permission === "denied" && (
        <p className="mb-4 rounded-[16px] border-[3px] border-dashed border-bro-ink bg-white p-3 text-[13px] font-extrabold">
          notifications are blocked 🙉 turn them back on in your browser
          settings to get roasted.
        </p>
      )}

      <FieldLabel>ROAST LEVEL 🌶️</FieldLabel>
      <div className="mb-4">
        <Segmented
          label="Roast level"
          value={roast}
          options={ROAST_LEVELS}
          onPick={onPickRoast}
        />
      </div>

      <div className="flex flex-col gap-2.5">
        {preview.map((row, i) => (
          <div
            key={row.sub.id}
            className="flex items-start gap-2.5 rounded-[16px] border-[3px] border-bro-ink bg-white px-3 py-2.5 shadow-hard"
          >
            <div
              className="flex size-9 flex-none items-center justify-center rounded-[10px] border-[3px] border-bro-ink font-display text-base"
              style={{ background: chipColor(i) }}
              aria-hidden="true"
            >
              {row.sub.name[0]?.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex justify-between gap-2 text-[10px] font-black tracking-[0.06em] text-neutral-500">
                <span>DON&apos;T CHARGE ME BRO</span>
                <span>now</span>
              </div>
              <p className="mt-0.5 text-[13px] leading-snug font-extrabold">
                {roastLine(roast, row.sub.name, row.days, row.sub.amount)}
              </p>
            </div>
          </div>
        ))}

        {preview.length === 0 && (
          <p className="rounded-[16px] border-[3px] border-dashed border-bro-ink bg-white p-5 text-center text-[13px] font-black">
            nothing to roast yet. add a leech and we&apos;ll cook. 🔥
          </p>
        )}
      </div>
    </div>
  );
}
