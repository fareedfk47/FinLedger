/**
 * Pagination — previous / next controls with page indicator.
 * Props:
 *   pagination: { page, totalPages, hasNextPage, hasPreviousPage }
 *   onNext: () => void
 *   onPrev: () => void
 */
function Pagination({ pagination, onNext, onPrev }) {
  if (!pagination || pagination.totalPages <= 1) return null;

  const { page, totalPages, hasNextPage, hasPreviousPage } = pagination;

  return (
    <div className="flex items-center justify-between px-1 py-3">
      <button
        onClick={onPrev}
        disabled={!hasPreviousPage}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-primary disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-container transition-colors"
      >
        <span className="material-symbols-outlined text-[18px]">
          chevron_left
        </span>
        Previous
      </button>

      <span className="text-sm text-on-surface-variant font-medium">
        {page} / {totalPages}
      </span>

      <button
        onClick={onNext}
        disabled={!hasNextPage}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-primary disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-container transition-colors"
      >
        Next
        <span className="material-symbols-outlined text-[18px]">
          chevron_right
        </span>
      </button>
    </div>
  );
}

export default Pagination;
