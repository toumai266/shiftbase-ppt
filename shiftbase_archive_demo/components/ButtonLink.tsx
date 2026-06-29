import Link from "next/link";
import type { ReactNode } from "react";

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md";
  className?: string;
};

const base =
  "focus-ring inline-flex items-center justify-center gap-2 font-semibold transition-colors";

const variants = {
  primary:
    "bg-primary text-white hover:bg-primary-dark active:bg-primary-dark",
  secondary:
    "bg-white text-ink border border-line hover:bg-soft active:bg-soft",
  ghost:
    "text-primary hover:bg-primary-light active:bg-primary-light"
};

const sizes = {
  sm: "h-9 rounded-lg px-3.5 text-sm",
  md: "h-11 rounded-xl px-5 text-sm"
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
  size = "md",
  className = ""
}: ButtonLinkProps) {
  return (
    <Link
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      href={href}
    >
      {children}
    </Link>
  );
}
