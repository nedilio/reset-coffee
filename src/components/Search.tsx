"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

export default function Search() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [inputValue, setInputValue] = useState(
    searchParams.get("filter") || ""
  );
  const [debouncedValue, setDebouncedValue] = useState(inputValue);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(inputValue);
    }, 250);

    return () => {
      clearTimeout(handler);
    };
  }, [inputValue]);

  useEffect(() => {
    if (debouncedValue !== searchParams.get("filter")) {
      const params = new URLSearchParams(searchParams);
      const page = params.get("page");
      if (debouncedValue === "") {
        params.delete("filter");
        page && params.set("page", page);
      } else {
        params.set("filter", debouncedValue);
        params.delete("page");
      }
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [debouncedValue, pathname, router, searchParams, inputValue]);

  return (
    <>
      <div className="w-full relative">
        <Input
          className="bg-gray-100"
          placeholder="🔍 Buscar por nombre..."
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <Button
          variant="outline"
          className="absolute top-0 right-0"
          onClick={() => setInputValue("")}
        >
          ❌
        </Button>
      </div>
    </>
  );
}
