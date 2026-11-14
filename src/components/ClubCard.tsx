import { cn } from "@/lib/utils";

// The green Reset Club panel with soft decorative circles, shared by the public pages.
export default function ClubCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "relative w-full max-w-md overflow-hidden rounded-2xl bg-resetGreen p-5 text-white shadow-md sm:p-7",
        className
      )}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-12 size-36 rounded-full bg-white/[0.06]"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-14 -left-8 size-32 rounded-full bg-white/[0.05]"
      />
      <div className="relative flex flex-col items-center gap-4">{children}</div>
    </section>
  );
}
