export function JoinWaitingState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto flex h-full w-full max-w-2xl flex-1 items-center justify-center px-4 relative z-10">
      <div className="absolute inset-0 -z-10 h-[500px] w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 rounded-full bg-gradient-to-tr from-[#52B788]/20 via-[#95D5B2]/20 to-[#B7E4C7]/20 blur-[100px] animate-pulse" />
      
      <div className="w-full rounded-[32px] border border-white/40 bg-white/60 p-10 text-center shadow-2xl shadow-[#113023]/10 backdrop-blur-2xl">
        <div className="relative mx-auto mb-8 flex h-24 w-24 items-center justify-center">
          <div className="absolute inset-0 animate-pulse-glow rounded-full bg-[#52B788]/20" />
          <div className="absolute inset-2 animate-pulse-glow rounded-full bg-[#52B788]/40" style={{ animationDelay: "0.5s" }} />
          <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-[#113023] to-[#52B788] shadow-[0_0_30px_rgba(82,183,136,0.5)]" />
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-[#52B788]/50 bg-[#52B788]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#113023] shadow-sm backdrop-blur-md">
          Status: In Lobby
        </div>
        <h2 className="mt-5 text-3xl font-extrabold text-slate-900">{title}</h2>
        <p className="mx-auto mt-4 max-w-md text-base font-medium leading-relaxed text-slate-600">{description}</p>
      </div>
    </div>
  );
}
