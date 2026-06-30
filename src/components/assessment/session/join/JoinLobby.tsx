import { ArrowRight, Users, Zap, CheckCircle2, User } from "lucide-react";
import { Label } from "@/src/components/ui/ui/label";
import { Button } from "@/src/components/ui/ui/button";
import { Input } from "@/src/components/ui/ui/input";

export function JoinLobby({
  requiresIdentity,
  displayName,
  onDisplayNameChange,
  email,
  onEmailChange,
  onJoin,
  eventName,
}: {
  requiresIdentity: boolean;
  displayName: string;
  onDisplayNameChange: (value: string) => void;
  email: string;
  onEmailChange: (value: string) => void;
  onJoin: () => void;
  eventName?: string;
}) {
  return (
    <div className="relative z-10 mx-auto my-auto flex w-full max-w-md flex-col items-center justify-center py-2">
      <div className="absolute inset-0 -z-10 h-[420px] w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 rounded-full bg-gradient-to-tr from-[#52B788]/20 via-[#95D5B2]/20 to-[#B7E4C7]/20 blur-[80px] animate-pulse" />
      
      <div className="w-full overflow-hidden rounded-[26px] border border-white/40 bg-white/60 shadow-2xl shadow-[#113023]/10 backdrop-blur-2xl">
        
        {/* Header Section */}
        <div className="border-b border-white/40 bg-gradient-to-b from-white/40 to-transparent p-5 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-[18px] bg-gradient-to-tr from-[#113023] to-[#52B788] shadow-[0_0_30px_rgba(82,183,136,0.35)]">
            <Users className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Join the Live Session
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-600 font-medium">
            Enter the lobby to secure your spot. The session will begin shortly when the host starts.
          </p>

          {/* Inline Badges */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <div className="flex items-center gap-2 rounded-full border border-[#52B788]/30 bg-[#52B788]/10 px-3 py-1.5 text-xs font-bold text-[#113023] shadow-sm backdrop-blur-md">
              <User className="h-4 w-4" />
              {requiresIdentity ? "Identity required" : "Anonymous session"}
            </div>
            <div className="flex items-center gap-2 rounded-full border border-amber-200/50 bg-gradient-to-r from-amber-100 to-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 shadow-sm backdrop-blur-md">
              <Zap className="h-4 w-4 text-amber-500" />
              Speed bonus active
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-white/40 p-5">
          {requiresIdentity ? (
            <div className="space-y-4">
              <div className="space-y-3">
                <Label className="block space-y-2">
                  <span className="text-[13px] font-bold uppercase tracking-wider text-slate-500">Display Name</span>
                  <Input
                    type="text"
                    value={displayName}
                    onChange={(event) => onDisplayNameChange(event.target.value)}
                    placeholder="Enter your name"
                    className="h-11 w-full rounded-2xl border-2 border-white/60 bg-white/50 px-4 text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 hover:border-[#95D5B2] focus:border-[#52B788] focus:bg-white focus:ring-4 focus:ring-[#52B788]/20 shadow-inner"
                  />
                </Label>
                <Label className="block space-y-2">
                  <span className="text-[13px] font-bold uppercase tracking-wider text-slate-500">Email Address</span>
                  <Input
                    type="email"
                    value={email}
                    onChange={(event) => onEmailChange(event.target.value)}
                    placeholder="Enter your email"
                    className="h-11 w-full rounded-2xl border-2 border-white/60 bg-white/50 px-4 text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 hover:border-[#95D5B2] focus:border-[#52B788] focus:bg-white focus:ring-4 focus:ring-[#52B788]/20 shadow-inner"
                  />
                </Label>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-[#52B788]/30 bg-[#52B788]/10 p-3 backdrop-blur-sm">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#113023]" />
                <p className="text-xs font-medium leading-relaxed text-[#113023]/80">
                  Your identity helps us prevent duplicate entries and ensures your answers are securely associated with your email.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-[22px] border-2 border-dashed border-[#95D5B2] bg-[#52B788]/10 p-6 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-md">
                <User className="h-6 w-6 text-[#52B788]" />
              </div>
              <p className="text-lg font-bold text-slate-900">Anonymous Lobby</p>
              <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">No display name is required for this session.</p>
            </div>
          )}

          <div className="mt-5">
            <Button
              type="button"
              data-flow-event={eventName}
              disabled={requiresIdentity && (displayName.trim().length === 0 || email.trim().length === 0)}
              onClick={onJoin}
              className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-[#113023] to-[#52B788] px-5 py-4 text-base font-bold text-white shadow-[0_0_30px_rgba(82,183,136,0.3)] transition-all hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(82,183,136,0.5)] disabled:opacity-50 disabled:hover:scale-100"
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
              Join Lobby
              <ArrowRight className="ml-2 h-6 w-6 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
