'use client';

import { useCallback, useTransition } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { STATE_CODE_TO_NAME } from '@docujourney/utils';

// Filter and sort controls for the sponsors directory. The API has supported
// state/salary filtering all along — this exposes it, plus the new sort param.
// All state lives in the URL so results stay shareable and crawlable.
export function SponsorsControls() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const setParam = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page'); // filter/sort changes restart at page 1
    startTransition(() => {
      router.push(params.toString() ? `${pathname}?${params.toString()}` : pathname, { scroll: false });
    });
  }, [router, pathname, searchParams]);

  const selectClass =
    'h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20';

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6" aria-busy={isPending}>
      <select
        className={selectClass}
        value={searchParams.get('state') || ''}
        onChange={e => setParam('state', e.target.value)}
        aria-label="Filter by state"
      >
        <option value="">All states</option>
        {Object.entries(STATE_CODE_TO_NAME).map(([code, name]) => (
          <option key={code} value={code}>{name}</option>
        ))}
      </select>

      <select
        className={selectClass}
        value={searchParams.get('minSalary') || ''}
        onChange={e => setParam('minSalary', e.target.value)}
        aria-label="Minimum offered wage"
      >
        <option value="">Any salary</option>
        <option value="100000">Wages $100K+</option>
        <option value="120000">Wages $120K+</option>
        <option value="140000">Wages $140K+</option>
        <option value="160000">Wages $160K+</option>
        <option value="200000">Wages $200K+</option>
      </select>

      <select
        className={selectClass}
        value={searchParams.get('sort') || 'applications'}
        onChange={e => setParam('sort', e.target.value === 'applications' ? '' : e.target.value)}
        aria-label="Sort by"
      >
        <option value="applications">Most filings</option>
        <option value="salary">Highest average salary</option>
        <option value="certification">Highest certification rate</option>
      </select>

      {isPending && (
        <span className="text-sm text-gray-500 flex items-center gap-2">
          <span className="inline-block w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          Updating…
        </span>
      )}
    </div>
  );
}
