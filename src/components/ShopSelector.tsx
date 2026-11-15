"use client";

import { useTransition } from "react";
import { IconMapPin } from "@tabler/icons-react";
import { toast } from "sonner";
import { setShop } from "@/actions/shop";
import { cn } from "@/lib/utils";

// Which shop this device works at. Stored in a cookie by setShop; shown only with 2+ shops.
export default function ShopSelector({
  names,
  current,
}: {
  names: string[];
  current: string | null;
}) {
  const [pending, startTransition] = useTransition();
  if (names.length < 2) return null;

  return (
    <div
      className={cn(
        "mb-3 flex items-center gap-2 rounded-xl border bg-white p-2 shadow-sm",
        current ? "border-resetGreen/15" : "border-resetOrange"
      )}
    >
      <span className="flex shrink-0 items-center gap-1 pl-1 text-sm font-medium text-resetGreen">
        <IconMapPin className="size-4" aria-hidden="true" />
        {current ? "Local" : "Elige el local"}
      </span>
      <div className="flex flex-1 gap-1" role="group" aria-label="Local">
        {names.map((name) => (
          <button
            key={name}
            type="button"
            aria-pressed={name === current}
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const result = await setShop(name);
                if ("error" in result) toast.error(result.error);
              })
            }
            className={cn(
              "h-9 flex-1 rounded-lg text-sm font-medium transition-colors",
              name === current
                ? "bg-resetGreen text-white"
                : "text-resetGreen hover:bg-resetGreen/10"
            )}
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}
