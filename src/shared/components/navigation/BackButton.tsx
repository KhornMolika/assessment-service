import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type BackButtonVariant = "outline" | "inverse" | "solid";

const variantClassNames: Record<BackButtonVariant, string> = {
  outline:
    "border border-border bg-white text-primary hover:bg-muted",
  inverse:
    "border border-white/15 bg-white/8 text-white/75 backdrop-blur-sm hover:bg-white/12 hover:text-white",
  solid:
    "border border-transparent bg-primary text-white hover:bg-pl",
};

export function BackButton({
  href,
  label,
  variant = "outline",
  fullWidth = false,
  className = "",
}: {
  href: string;
  label: string;
  variant?: BackButtonVariant;
  fullWidth?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition",
        fullWidth ? "w-full" : "self-start",
        variantClassNames[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Link>
  );
}
