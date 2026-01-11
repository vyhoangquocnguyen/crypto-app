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
import { buildPageNumbers, cn, ELLIPSIS } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function CoinsPagination({ currentPage, totalPages, hasMorePages }: Pagination) {
  const router = useRouter();
  const handlePageChange = (page: number) => {
    router.push(`/coins?page=${page}`);
  };

  const pageNumber = buildPageNumbers(currentPage, totalPages);
  const isLastPage = !hasMorePages || currentPage === totalPages;
  return (
    <Pagination id="coins-pagination">
      <PaginationContent className="pagination-content">
        <PaginationItem className="pagination-control prev">
          <PaginationPrevious
            onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
            className={currentPage === 1 ? "control-disable" : "control-button"}
          />
        </PaginationItem>

        <div className="pagination-pages">
          {pageNumber.map((page, index) => (
            <PaginationItem key={index} className="pagination-page-item">
              {page === ELLIPSIS ? (
                <span className="ellipsis">...</span>
              ) : (
                <PaginationLink
                  onClick={() => handlePageChange(page)}
                  className={cn(`page-link`, {
                    "page-link-active": currentPage === page,
                  })}>
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}
        </div>
        <PaginationItem className="pagination-control next">
          <PaginationNext
            onClick={() => !isLastPage && handlePageChange(currentPage + 1)}
            className={isLastPage ? "control-disable" : "control-button"}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
