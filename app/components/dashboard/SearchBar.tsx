'use client';

import { useStore } from '@/lib/store';

export default function SearchBar() {
  const searchQuery = useStore((s) => s.searchQuery);
  const setSearchQuery = useStore((s) => s.setSearchQuery);
  const setFilterModalOpen = useStore((s) => s.setFilterModalOpen);
  const filterPlatform = useStore((s) => s.filterPlatform);
  const filterCategory = useStore((s) => s.filterCategory);

  const hasFilter = filterPlatform !== 'all' || filterCategory !== null;

  return (
    <div className="mx-6 mb-4 flex gap-2">
      <div className="flex-1 relative">
        <svg
          className="absolute left-[14px] text-text-faint pointer-events-none"
          style={{ top: '50%', transform: 'translateY(-50%)' }}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.5" y2="16.5" />
        </svg>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="트렌드, 크리에이터, 해시태그..."
          className="w-full py-3 pl-[42px] pr-4 bg-surface-1 border border-border rounded-xl text-text font-body text-sm transition-all outline-none focus:border-accent-lime focus:bg-surface-2 placeholder:text-text-faint"
        />
      </div>
      <button
        onClick={() => setFilterModalOpen(true)}
        className={`flex-shrink-0 w-11 h-11 bg-surface-1 border rounded-xl cursor-pointer grid place-items-center transition-all relative ${
          hasFilter
            ? 'border-accent-lime text-accent-lime'
            : 'border-border text-text-dim hover:border-border-bright hover:text-text'
        }`}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="6" y1="12" x2="18" y2="12" />
          <line x1="9" y1="18" x2="15" y2="18" />
        </svg>
        {hasFilter && (
          <span
            className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-accent-lime"
            style={{ boxShadow: '0 0 6px var(--accent-lime)' }}
          />
        )}
      </button>
    </div>
  );
}
