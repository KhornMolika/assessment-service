import Link from "next/link";
import { ChevronLeft } from "lucide-react";

type BackButtonVariant = "outline" | "inverse" | "solid" | "ghost";

const variantClassNames: Record<BackButtonVariant, string> = {
  outline:
    "border border-border bg-white text-primary hover:bg-muted",
  inverse:
    "border border-white/15 bg-white/8 text-white/75 backdrop-blur-sm hover:bg-white/12 hover:text-white",
  solid:
    "border border-transparent bg-primary text-white hover:bg-pl",
  ghost:
    "bg-transparent text-primary hover:bg-muted/50",
};

export function BackButton({
  href,
  label,
  variant = "ghost",
  fullWidth = false,
  className = "",
}: {
  href: string;
  label?: string;
  variant?: BackButtonVariant;
  fullWidth?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={[
        "inline-flex items-center justify-center rounded-2xl text-sm font-semibold transition",
        label ? "gap-2 px-5 py-3" : "h-10 w-10",
        fullWidth ? "w-full" : "self-start",
        variantClassNames[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label={label || "Go back"}
    >
      <ChevronLeft className={label ? "h-4 w-4" : "h-6 w-6"} />
      {label ? <span>{label}</span> : null}
    </Link>
  );
}
