import clsx from "clsx";
import type { LucideIcon } from "lucide-react";

type LinkButtonProps = {
  href: string;
  label: string;
  icon?: LucideIcon;
  variant?: "primary" | "secondary" | "ghost";
  download?: boolean;
};

export function LinkButton({
  href,
  label,
  icon: Icon,
  variant = "secondary",
  download = false
}: LinkButtonProps) {
  const external = href.startsWith("http");

  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      download={download}
      className={clsx(
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-bold transition duration-200 ease-out hover:-translate-y-1 focus-visible:-translate-y-1",
        variant === "primary" &&
          "border-[var(--gold)] bg-[var(--gold)] text-[var(--ink)] shadow-[0_18px_46px_rgba(231,188,92,0.22)] hover:shadow-[0_22px_58px_rgba(231,188,92,0.34)]",
        variant === "secondary" &&
          "border-[var(--line-strong)] bg-[rgba(247,243,232,0.06)] text-[var(--text)] hover:border-[var(--cyan)] hover:bg-[rgba(70,199,216,0.1)]",
        variant === "ghost" &&
          "border-[var(--line)] bg-transparent text-[var(--text-soft)] hover:border-[var(--gold)] hover:text-[var(--gold)]"
      )}
    >
      {Icon ? <Icon aria-hidden="true" size={18} strokeWidth={2.2} /> : null}
      <span>{label}</span>
    </a>
  );
}
