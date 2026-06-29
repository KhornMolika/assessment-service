export function JoinWaitingState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="relative z-10 mx-auto flex h-full w-full max-w-xl flex-1 items-center justify-center px-4">
      <div className="absolute inset-0 -z-10 h-[360px] w-full max-w-xl -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 rounded-full bg-gradient-to-tr from-[#52B788]/20 via-[#95D5B2]/20 to-[#B7E4C7]/20 blur-[80px] animate-pulse" />
      
      <div className="w-full rounded-[26px] border border-white/40 bg-white/60 p-7 text-center shadow-2xl shadow-[#113023]/10 backdrop-blur-2xl">
        <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center">
          <div className="absolute inset-0 animate-pulse-glow rounded-full bg-[#52B788]/20" />
          <div className="absolute inset-2 animate-pulse-glow rounded-full bg-[#52B788]/40" style={{ animationDelay: "0.5s" }} />
          <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-[#113023] to-[#52B788] shadow-[0_0_30px_rgba(82,183,136,0.5)]" />
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-[#52B788]/50 bg-[#52B788]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#113023] shadow-sm backdrop-blur-md">
          Status: In Lobby
        </div>
        <h2 className="mt-4 text-2xl font-extrabold text-slate-900">{title}</h2>
        <p className="mx-auto mt-3 max-w-md text-sm font-medium leading-relaxed text-slate-600">{description}</p>
      </div>
    </div>
  );
}
