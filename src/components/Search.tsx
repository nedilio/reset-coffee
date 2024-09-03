"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useDebouncedCallback } from "use-debounce";

export default function Search() {
  const { replace } = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleChange = useDebouncedCallback((search: string) => {
    const params = new URLSearchParams(searchParams);
    if (search) {
      params.set("filter", search);
      params.set("page", "1");
    } else {
      params.delete("filter");
      params.set("page", "1");
    }
    replace(`${pathname}?${params.toString()}`);
  }, 250);

  const handleReset = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("filter");
    params.set("page", "1");

    // clean input
    const input = document.getElementById("filter") as HTMLInputElement;
    input.value = "";
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <>
      <div className="w-full relative">
        <Input
          className="bg-gray-100"
          placeholder="🔍 Buscar por nombre..."
          type="text"
          id="filter"
          defaultValue={searchParams.get("filter") || ""}
          onChange={(event) => handleChange(event.target.value)}
        />
        <Button
          variant="outline"
          className="absolute top-0 right-0"
          onClick={handleReset}
        >
          ❌
        </Button>
      </div>
    </>
  );
}
