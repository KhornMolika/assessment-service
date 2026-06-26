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
    <div className="mx-auto flex w-full max-w-2xl my-auto flex-col items-center justify-center py-6 sm:py-8">
      <div className="w-full overflow-hidden rounded-[32px] border border-border/60 bg-white/70 shadow-2xl shadow-primary/5 backdrop-blur-xl">
        
        {/* Header Section */}
        <div className="border-b border-border/50 bg-gradient-to-b from-primary/[0.03] to-transparent p-6 text-center sm:p-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#4CC9F0_0%,#277DA1_100%)] shadow-lg shadow-sky-500/20">
            <Users className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">
            Join the live session
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-inkd">
            Enter the lobby to secure your spot. The session will begin shortly when the host starts.
          </p>

          {/* Inline Badges */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-border/80 bg-white px-4 py-1.5 text-xs font-semibold text-primary shadow-sm">
              <User className="h-4 w-4 text-primary/70" />
              {requiresIdentity ? "Identity required" : "Anonymous session"}
            </div>
            <div className="flex items-center gap-2 rounded-full border border-border/80 bg-[linear-gradient(135deg,#F9C74F_0%,#FFD166_100%)] px-4 py-1.5 text-xs font-semibold text-primary shadow-sm">
              <Zap className="h-4 w-4 text-primary" />
              Speed bonus active
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="p-6 sm:p-8">
          {requiresIdentity ? (
            <div className="space-y-5">
              <div className="space-y-4">
                <Label className="block space-y-2">
                  <span className="text-sm font-semibold text-primary">Display Name</span>
                  <Input
                    type="text"
                    value={displayName}
                    onChange={(event) => onDisplayNameChange(event.target.value)}
                    placeholder="Enter your name"
                    className="h-12 w-full rounded-2xl border-2 border-border/60 bg-white px-4 text-sm text-primary outline-none transition placeholder:text-primary/30 hover:border-primary/20 focus:border-primary focus:ring-4 focus:ring-primary/10"
                  />
                </Label>
                <Label className="block space-y-2">
                  <span className="text-sm font-semibold text-primary">Email Address</span>
                  <Input
                    type="email"
                    value={email}
                    onChange={(event) => onEmailChange(event.target.value)}
                    placeholder="Enter your email"
                    className="h-12 w-full rounded-2xl border-2 border-border/60 bg-white px-4 text-sm text-primary outline-none transition placeholder:text-primary/30 hover:border-primary/20 focus:border-primary focus:ring-4 focus:ring-primary/10"
                  />
                </Label>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                <p className="text-sm leading-relaxed text-blue-900/80">
                  Your identity helps us prevent duplicate entries and ensures your answers are securely associated with your email.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/30 p-8 text-center">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
                <User className="h-5 w-5 text-primary/40" />
              </div>
              <p className="text-base font-semibold text-primary">Anonymous Lobby</p>
              <p className="mt-2 text-sm leading-relaxed text-inkd">No display name is required for this session.</p>
            </div>
          )}

          <div className="mt-6 flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-end">
            <Button
              type="button"
              data-flow-event={eventName}
              disabled={requiresIdentity && (displayName.trim().length === 0 || email.trim().length === 0)}
              onClick={onJoin}
              className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#F94144_0%,#FF6B6F_100%)] px-6 text-sm font-semibold text-white shadow-lg shadow-red-500/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-red-500/30 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none sm:w-auto"
            >
              Join lobby
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
