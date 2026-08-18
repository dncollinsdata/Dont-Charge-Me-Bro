import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
} from "react";
import { cn } from "@/lib/utils";

const TONES = {
  pink: "bg-bro-pink text-white",
  lime: "bg-bro-lime text-bro-ink",
  yellow: "bg-bro-yellow text-bro-ink",
  white: "bg-white text-bro-ink",
  ink: "bg-bro-ink text-white hover:bg-bro-pink",
} as const;

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: keyof typeof TONES;
};

export function Btn({
  tone = "pink",
  className,
  type = "button",
  ...rest
}: BtnProps) {
  return (
    <button
      type={type}
      className={cn(
        "press cursor-pointer rounded-full border-[3px] border-bro-ink shadow-hard-md",
        TONES[tone],
        className,
      )}
      {...rest}
    />
  );
}

/** Section heading — Titan One, always slightly off-axis. */
export function Heading({
  size = "md",
  className,
  children,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
  children: ReactNode;
}) {
  return (
    <h2
      className={cn(
        "font-display",
        size === "sm" && "text-[15px]",
        size === "md" && "text-[26px] [text-shadow:3px_3px_0_#fff]",
        size === "lg" &&
          "text-[44px] leading-[1.02] [text-shadow:4px_4px_0_#fff]",
        className,
      )}
    >
      {children}
    </h2>
  );
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <span className="mb-1.5 block text-[11px] font-black tracking-[0.05em]">
      {children}
    </span>
  );
}

export function Field({
  className,
  ...rest
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-xl border-[3px] border-bro-ink bg-white px-3 py-2.5 text-[15px] font-extrabold text-bro-ink shadow-hard-sm outline-none focus:shadow-hard",
        className,
      )}
      {...rest}
    />
  );
}

/** Three-up pill selector used for cycle type and roast level. */
export function Segmented<T extends string>({
  value,
  options,
  onPick,
  label,
}: {
  value: T;
  options: { value: T; label: string }[];
  onPick: (value: T) => void;
  label: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="grid grid-cols-3 gap-2"
    >
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onPick(o.value)}
            className={cn(
              "press cursor-pointer rounded-full border-[3px] border-bro-ink px-1 py-2.5 text-center text-xs font-black shadow-hard-sm",
              on
                ? "bg-bro-ink text-white shadow-[3px_3px_0_rgba(0,0,0,0.25)]"
                : "bg-white text-bro-ink",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
