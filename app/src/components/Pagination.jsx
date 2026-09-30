import { ChevronLeft, ChevronRight } from 'lucide-react';

// 1 ... 4 5 6 ... 12  (always keeps first, last and the neighbours of the current page)
function getPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push('gap-' + p);
    out.push(p);
  });
  return out;
}

const btn =
  'min-w-9 h-9 px-2 inline-flex items-center justify-center rounded-lg text-xs font-semibold transition cursor-pointer';

export default function Pagination({ currentPage, totalPages, totalItems, pageSize, onPageChange }) {
  if (totalItems <= pageSize) return null;

  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalItems);

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2"
    >
      <p className="text-xs text-gray-500">
        แสดง <span className="font-semibold text-gray-800">{from}-{to}</span> จาก{' '}
        <span className="font-semibold text-gray-800">{totalItems}</span> รายการ
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
          className={`${btn} border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white`}
        >
          <ChevronLeft size={16} />
        </button>

        {/* phones: just "2 / 7" so it never overflows */}
        <span className="sm:hidden px-3 text-xs font-semibold text-gray-700">
          {currentPage} / {totalPages}
        </span>

        {/* sm and up: numbered buttons */}
        <div className="hidden sm:flex items-center gap-1">
          {getPageNumbers(currentPage, totalPages).map((p) =>
            typeof p === 'string' ? (
              <span key={p} className="px-1 text-xs text-gray-400">…</span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                aria-current={p === currentPage ? 'page' : undefined}
                className={`${btn} ${
                  p === currentPage
                    ? 'bg-black text-white shadow-xs'
                    : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {p}
              </button>
            )
          )}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
          className={`${btn} border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white`}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </nav>
  );
}
