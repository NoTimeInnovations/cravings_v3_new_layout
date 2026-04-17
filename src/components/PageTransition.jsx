import { cn } from "@/lib/utils";

/**
 * PageTransition wraps a page root so it smoothly fades in on mount.
 * Uses opacity-only animation to avoid creating a containing block
 * that would trap position:fixed children (WelcomeSplash, sheets, etc.).
 * Celebrate variant uses transform but is only applied to OrderConfirmation
 * which has no fixed descendants.
 */
export default function PageTransition({
  children,
  variant = "default",
  className,
}) {
  const animClass =
    variant === "celebrate"
      ? "animate-celebrate"
      : variant === "right"
      ? "animate-page-enter-right"
      : "animate-page-enter";

  return <div className={cn(animClass, className)}>{children}</div>;
}
