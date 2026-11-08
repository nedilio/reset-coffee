import Link from "next/link";
import { cn } from "@/lib/utils";

// The logo is an opaque webp with the app's beige background, so it must sit on the page
// background, never on a white card.
export default function BrandLogo({
  size = "lg",
  href = "/",
  className,
}: {
  size?: "sm" | "lg";
  href?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      aria-label="Reset Coffee, inicio"
      className={cn("shrink-0 rounded-md", className)}
    >
      <img
        className={cn(size === "lg" ? "mx-auto w-52" : "h-11 w-auto")}
        width={size === "lg" ? 208 : 106}
        height={size === "lg" ? 86 : 44}
        src="/img/reset-coffee-logo.webp"
        alt="Reset Coffee"
      />
    </Link>
  );
}
