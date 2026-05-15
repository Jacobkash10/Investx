import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationProps = {
  page: number;
  totalPages: number;
  basePath: string;
  searchParams?: Record<string, string | undefined>;
};

export function Pagination({
  page,
  totalPages,
  basePath,
  searchParams = {},
}: PaginationProps) {
  function buildUrl(newPage: number) {
    const params = new URLSearchParams();

    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });

    params.set("page", String(newPage));

    return `${basePath}?${params.toString()}`;
  }

  if (totalPages <= 1) {
    return null;
  }

  function getPaginationPages(page: number, totalPages: number) {
    const delta = 2;
    const pages: (number | "...")[] = [];

    const left = Math.max(2, page - delta);
    const right = Math.min(totalPages - 1, page + delta);

    pages.push(1);

    if (left > 2) pages.push("...");

    for (let i = left; i <= right; i++) {
      pages.push(i);
    }

    if (right < totalPages - 1) pages.push("...");

    if (totalPages > 1) pages.push(totalPages);

    return pages;
  }

  const pages = getPaginationPages(page, totalPages);

  return (
    <div className="flex flex-col gap-4 rounded-4xl border border-white/10 bg-white/6 p-5 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium text-slate-400">
          Page{" "}
          <span className="font-black text-white">
            {page}
          </span>{" "}
          sur{" "}
          <span className="font-black text-white">
            {totalPages}
          </span>
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {page > 1 && (
          <Link
            href={buildUrl(page - 1)}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/4 px-4 py-2 text-sm font-bold text-slate-300 transition hover:bg-white/8"
          >
            <ChevronLeft className="h-4 w-4" />
            Précédent
          </Link>
        )}

        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
          {pages.map((pageNumber, index) => {
            if (pageNumber === "...") {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="flex h-10 w-10 items-center justify-center text-slate-500"
                >
                  ...
                </span>
              );
            }

            const isActive = page === pageNumber;

            return (
              <Link
                key={pageNumber}
                href={buildUrl(pageNumber)}
                className={`flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-black transition-all duration-200 ${
                  isActive
                    ? "border border-emerald-400/30 bg-emerald-400/15 text-emerald-300 shadow-lg shadow-emerald-500/10"
                    : "border border-white/10 bg-white/4 text-slate-300 hover:bg-white/8"
                }`}
              >
                {pageNumber}
              </Link>
            );
          })}
        </div>

        {page < totalPages && (
          <Link
            href={buildUrl(page + 1)}
            className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-300 transition hover:bg-cyan-400/20 hover:text-cyan-200"
          >
            Suivant
            <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </div>
  );
}