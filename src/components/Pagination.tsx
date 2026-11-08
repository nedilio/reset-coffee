"use client";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { range } from "@/lib";

import { CLIENTS_PER_PAGE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { usePathname, useSearchParams } from "next/navigation";

interface PaginationProps {
  count: number;
  currentPage: number;
}
const TablePagination = ({ count, currentPage }: PaginationProps) => {
  const pages = Math.ceil(count / CLIENTS_PER_PAGE);
  const searchParams = useSearchParams();
  const pathName = usePathname();
  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    return {
      pathname: pathName,
      search: params.toString(),
    };
  };
  if (pages <= 1) return null;

  // First, last and the neighbours of the current page; gaps become one ellipsis.
  const visible = range(pages)
    .map((i) => i + 1)
    .filter((p) => p === 1 || p === pages || Math.abs(p - currentPage) <= 1);
  const items: (number | "gap")[] = [];
  visible.forEach((p, i) => {
    if (i > 0 && p - visible[i - 1] > 1) items.push("gap");
    items.push(p);
  });

  const pageButton =
    "size-11 rounded-[10px] text-base font-semibold text-resetGreen hover:bg-resetGreen/10 hover:text-resetGreen active:scale-95";

  return (
    <Pagination className="border-t border-resetGreen/10 p-4">
      <PaginationContent className="gap-1.5">
        <PaginationItem>
          <PaginationLink
            href={createPageUrl(currentPage - 1)}
            aria-label="Página anterior"
            aria-disabled={currentPage <= 1}
            className={cn(
              pageButton,
              currentPage <= 1 && "pointer-events-none opacity-35"
            )}
          >
            <IconChevronLeft className="size-5" />
          </PaginationLink>
        </PaginationItem>
        {items.map((item, i) =>
          item === "gap" ? (
            <PaginationItem key={`gap-${i}`}>
              <PaginationEllipsis className="size-11 text-resetGreen" />
            </PaginationItem>
          ) : (
            <PaginationItem key={item}>
              <PaginationLink
                href={createPageUrl(item)}
                isActive={item === currentPage}
                className={cn(
                  pageButton,
                  item === currentPage &&
                    "border-resetGreen bg-resetGreen text-white hover:bg-resetGreen hover:text-white"
                )}
              >
                {item}
              </PaginationLink>
            </PaginationItem>
          )
        )}
        <PaginationItem>
          <PaginationLink
            href={createPageUrl(currentPage + 1)}
            aria-label="Página siguiente"
            aria-disabled={currentPage >= pages}
            className={cn(
              pageButton,
              currentPage >= pages && "pointer-events-none opacity-35"
            )}
          >
            <IconChevronRight className="size-5" />
          </PaginationLink>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default TablePagination;
