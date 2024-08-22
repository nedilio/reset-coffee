"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Input } from "./ui/input";

export default function Search() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [inputValue, setInputValue] = useState(
    searchParams.get("filter") || ""
  );
  const [debouncedValue, setDebouncedValue] = useState(inputValue);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      return params.toString();
    },
    [searchParams]
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(inputValue);
    }, 300); // 300ms debounce delay

    return () => {
      clearTimeout(handler);
    };
  }, [inputValue]);

  useEffect(() => {
    if (debouncedValue !== searchParams.get("filter")) {
      inputValue === ""
        ? router.push(pathname)
        : router.push(
            pathname + "?" + createQueryString("filter", debouncedValue)
          );
    }
  }, [
    debouncedValue,
    createQueryString,
    pathname,
    router,
    searchParams,
    inputValue,
  ]);

  return (
    <>
      <Input
        className="bg-gray-100"
        placeholder="🔍 Buscar por nombre..."
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
    </>
  );
}
