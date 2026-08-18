import { Btn, Heading } from "./ui";

export function Onboarding({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="screen-top relative flex flex-1 flex-col justify-center overflow-y-auto px-6 pb-10">
      <div className="wobble absolute top-6 right-4 rotate-[9deg] rounded-full border-[3px] border-bro-ink bg-bro-yellow px-3.5 py-2.5 text-center text-xs font-black shadow-hard">
        100%
        <br />
        FREE FR
      </div>

      <Heading size="lg" className="mb-4 -rotate-2">
        DON&apos;T
        <br />
        CHARGE
        <br />
        <span className="text-bro-pink">ME BRO!!</span>
      </Heading>

      <div className="mb-6 rotate-1 rounded-[18px] border-[3px] border-bro-ink bg-white p-4 text-[15px] leading-relaxed font-extrabold shadow-hard-lg">
        free trials end. bro forgets. bro pays $14.99 for an app he opened ONCE
        💀
        <br />
        <br />
        not anymore bestie. we track. we yeet. we keep the bag. 💰
      </div>

      <Btn
        tone="pink"
        onClick={onDismiss}
        className="p-4 font-display text-xl shadow-hard-lg"
      >
        LET&apos;S GOOO 🚀
      </Btn>

      <p className="mt-3.5 text-center text-xs font-extrabold text-bro-steel">
        no account 🙅 no card 🙅 nothing leaves the phone 🤐
      </p>
    </div>
  );
}
