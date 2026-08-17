export type TabScreen = "home" | "add" | "shame" | "notifs";

const TABS: { screen: TabScreen; label: string; emoji: string }[] = [
  { screen: "home", label: "HOME", emoji: "🏠" },
  { screen: "add", label: "ADD", emoji: "➕" },
  { screen: "shame", label: "SHAME", emoji: "💀" },
  { screen: "notifs", label: "ROASTS", emoji: "🔔" },
];

export function TabBar({
  active,
  onGo,
}: {
  active: string;
  onGo: (screen: TabScreen) => void;
}) {
  return (
    <nav className="grid flex-none grid-cols-4 border-t-4 border-bro-ink bg-white px-2 pt-2.5 pb-[calc(0.375rem+env(safe-area-inset-bottom))] text-center">
      {TABS.map((tab) => {
        const on = tab.screen === active;
        return (
          <button
            key={tab.screen}
            type="button"
            aria-current={on ? "page" : undefined}
            onClick={() => onGo(tab.screen)}
            className={`cursor-pointer py-1 transition-colors hover:text-bro-pink ${
              on ? "text-bro-pink" : "text-neutral-400"
            }`}
          >
            <div className="text-xl" aria-hidden="true">
              {tab.emoji}
            </div>
            <div className="mt-px text-[9px] font-black tracking-[0.08em]">
              {tab.label}
            </div>
          </button>
        );
      })}
    </nav>
  );
}
