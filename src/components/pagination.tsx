interface PaginationProps {
  totalItems: number;
  itemsPerPage?: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  totalItems,
  itemsPerPage = 25,
  currentPage,
  onPageChange,
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  return (
    <div className="mt-6 flex items-center justify-center space-x-2">
      <button
        onClick={() => goToPage(1)}
        disabled={currentPage === 1}
        className="rounded-md bg-gray-200 px-3 py-2 text-sm font-medium hover:bg-gray-300 disabled:opacity-50"
      >
        First
      </button>
      <button
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        className="rounded-md bg-gray-200 px-3 py-2 text-sm font-medium hover:bg-gray-300 disabled:opacity-50"
      >
        Prev
      </button>

      <span className="text-sm font-medium">
        Page {currentPage} of {totalPages}
      </span>

      <button
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="rounded-md bg-gray-200 px-3 py-2 text-sm font-medium hover:bg-gray-300 disabled:opacity-50"
      >
        Next
      </button>
      <button
        onClick={() => goToPage(totalPages)}
        disabled={currentPage === totalPages}
        className="rounded-md bg-gray-200 px-3 py-2 text-sm font-medium hover:bg-gray-300 disabled:opacity-50"
      >
        Last
      </button>
    </div>
  );
}
