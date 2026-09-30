import { useRef, useState } from 'react';

// Slices a list into pages.
// resetKey: pass something that changes when filters/search change (e.g. a string)
//           so the list jumps back to page 1.
export default function usePagination(items, pageSize, resetKey = '') {
  const [page, setPage] = useState(1);
  const [prevKey, setPrevKey] = useState(resetKey);
  const listRef = useRef(null);

  if (prevKey !== resetKey) {
    setPrevKey(resetKey);
    setPage(1);
  }

  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  // if items get removed, never sit on a page that no longer exists
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const pagedItems = items.slice(start, start + pageSize);

  const goToPage = (next) => {
    setPage(Math.min(Math.max(1, next), totalPages));
    // the app scrolls inside <main>, so scroll the list into view instead of window
    listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return { pagedItems, currentPage, totalPages, totalItems, pageSize, goToPage, listRef };
}
