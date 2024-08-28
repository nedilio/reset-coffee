"use client";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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
  return (
    <>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href={createPageUrl(currentPage - 1)}
              className={
                currentPage <= 1 ? "pointer-events-none opacity-35" : ""
              }
              aria-disabled={currentPage <= 1}
            />
          </PaginationItem>
          {range(pages).map((_, i) => {
            const page = i + 1;
            return (
              <PaginationItem key={page}>
                <PaginationLink
                  href={createPageUrl(page)}
                  isActive={page === currentPage}
                  aria-disabled
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            );
          })}

          <PaginationItem>
            <PaginationNext
              href={createPageUrl(currentPage + 1)}
              className={
                currentPage >= pages ? "pointer-events-none opacity-35" : ""
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </>
  );
};

export default TablePagination;
