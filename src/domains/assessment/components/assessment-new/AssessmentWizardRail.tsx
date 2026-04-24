import {
  Check,
  Clock3,
  FileText,
  ListChecks,
  Settings,
} from "lucide-react";

const stepIcons = {
  1: FileText,
  2: Settings,
  3: ListChecks,
  4: Clock3,
} as const;

export default function AssessmentWizardRail({
  className,
  currentStep,
  isStepComplete,
  canNavigateToStep,
  onStepChange,
}: {
  className?: string;
  currentStep: number;
  isStepComplete: (step: number) => boolean;
  canNavigateToStep: (step: number) => boolean;
  onStepChange: (step: number) => void;
}) {
  const steps = [
    { number: 1, title: "Basic Info" },
    { number: 2, title: "Session Strategy" },
    { number: 3, title: "Question Config" },
    { number: 4, title: "Timing & Rules" },
  ];

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-3xl bg-[linear-gradient(180deg,#214b3d_0%,#17352b_100%)] p-5 text-white shadow-xl xl:sticky xl:top-6 ${className ?? ""}`}
    >
      <div className="border-b border-white/10 pb-5">
        <h2 className="text-lg font-bold">New Assessment</h2>
        <p className="mt-1 text-xs text-white/65">Shape the assessment before it goes live.</p>
      </div>

      <div className="mt-5 flex-1 space-y-2 overflow-y-auto pr-1">
        {steps.map((step) => {
          const Icon = stepIcons[step.number as keyof typeof stepIcons];
          const active = currentStep === step.number;
          const complete = step.number < currentStep && isStepComplete(step.number);
          const canNavigate = canNavigateToStep(step.number);
          const disabled = !active && !complete && !canNavigate;
          const stateLabel = active ? "Active" : complete ? "Done" : disabled ? "Locked" : "Available";

          return (
            <button
              key={step.number}
              type="button"
              disabled={disabled}
              onClick={() => onStepChange(step.number)}
              className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${
                active
                  ? "bg-white/12 ring-1 ring-white/15"
                  : complete
                    ? "bg-emerald-50/10 hover:bg-emerald-50/15"
                    : disabled
                      ? "cursor-not-allowed opacity-45"
                      : "hover:bg-white/8"
              }`}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                  complete
                    ? "bg-[#95D5B2] text-[#17352b]"
                  : active
                      ? "bg-white/15 text-white ring-1 ring-white/20"
                      : disabled
                        ? "bg-white/5 text-white/45"
                        : "bg-white/10 text-white/80"
                }`}
              >
                {complete ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`text-xs uppercase tracking-[0.18em] ${
                    disabled ? "text-white/35" : "text-white/55"
                  }`}>
                    Step {step.number}
                  </p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                      active
                        ? "bg-white/15 text-white"
                        : complete
                          ? "bg-emerald-200/90 text-[#17352b]"
                          : disabled
                            ? "bg-white/8 text-white/45"
                            : "bg-white/10 text-white/70"
                    }`}
                  >
                    {stateLabel}
                  </span>
                </div>
                <p className={`text-sm font-semibold ${disabled ? "text-white/55" : "text-white"}`}>
                  {step.title}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
