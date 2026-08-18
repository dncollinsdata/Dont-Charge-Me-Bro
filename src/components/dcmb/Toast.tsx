export function Toast({ message }: { message: string }) {
  return (
    <div
      className="pop-in pointer-events-none absolute inset-x-5 bottom-24 z-40"
      role="status"
    >
      <div className="rounded-full border-[3px] border-white bg-bro-ink p-3 text-center text-sm font-black text-white shadow-[5px_5px_0_rgba(0,0,0,0.3)]">
        {message}
      </div>
    </div>
  );
}
