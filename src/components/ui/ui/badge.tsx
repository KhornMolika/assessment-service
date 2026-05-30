import * as React from "react";

function joinClasses(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const badgeVariants = {
  default: "bg-muted text-foreground",
  success: "bg-green-100 text-green-700",
  info: "bg-blue-100 text-blue-700",
  warning: "bg-yellow-100 text-yellow-700",
  pending: "bg-orange-100 text-orange-700",
  secondary: "bg-slate-100 text-slate-700",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  variant?: keyof typeof badgeVariants;
}) {
  return (
    <span
      className={joinClasses(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        badgeVariants[variant],
        className,
      )}
      {...props}
    />
  );
}
