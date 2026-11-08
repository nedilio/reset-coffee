"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { IconSearch, IconX } from "@tabler/icons-react";
import { useDebouncedCallback } from "use-debounce";
import { Input } from "./ui/input";

export default function Search() {
  const { replace } = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("filter") || "");

  const updateFilter = (search: string) => {
    const params = new URLSearchParams(searchParams);
    if (search) {
      params.set("filter", search);
    } else {
      params.delete("filter");
    }
    params.set("page", "1");
    replace(`${pathname}?${params.toString()}`);
  };

  const handleChange = useDebouncedCallback(updateFilter, 250);

  const handleReset = () => {
    setValue("");
    handleChange.cancel();
    updateFilter("");
  };

  return (
    <div className="relative p-4">
      <IconSearch
        aria-hidden="true"
        className="pointer-events-none absolute left-7 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        id="filter"
        type="text"
        aria-label="Buscar por nombre"
        placeholder="Buscar por nombre…"
        className="h-12 rounded-[10px] border-resetGreen/30 bg-white pl-11 pr-12 text-base focus-visible:ring-resetGreen"
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          handleChange(event.target.value);
        }}
      />
      {value && (
        <button
          type="button"
          onClick={handleReset}
          aria-label="Limpiar búsqueda"
          className="absolute right-6 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground hover:bg-resetGreen/10 active:scale-95"
        >
          <IconX className="size-5" />
        </button>
      )}
    </div>
  );
}
