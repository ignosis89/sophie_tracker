'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DayPicker, type DateRange } from 'react-day-picker';
import { format, subMonths } from 'date-fns';

function parseISODateLocal(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatISODateLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function DateRangePicker({ action, start, end }: { action: string; start?: string; end?: string }) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState<DateRange | undefined>(
    start && end ? { from: parseISODateLocal(start), to: parseISODateLocal(end) } : undefined
  );

  function toggleOpen() {
    if (!open) {
      // Refresh the draft selection from the URL each time the popover opens,
      // rather than syncing continuously via effect.
      setRange(start && end ? { from: parseISODateLocal(start), to: parseISODateLocal(end) } : undefined);
    }
    setOpen((v) => !v);
  }

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const label =
    start && end
      ? `${format(parseISODateLocal(start), 'MMM d, yyyy')} – ${format(parseISODateLocal(end), 'MMM d, yyyy')}`
      : 'All time';

  function handleApply() {
    if (range?.from && range?.to) {
      router.push(`${action}?start=${formatISODateLocal(range.from)}&end=${formatISODateLocal(range.to)}`);
    }
    setOpen(false);
  }

  function handleClear() {
    router.push(`${action}?range=all`);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        type="button"
        onClick={toggleOpen}
        className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:text-zinc-50 dark:focus:ring-zinc-100"
      >
        {label}
      </button>

      {open && (
        <div className="absolute z-10 mt-2 rounded-xl border border-zinc-200 bg-white p-4 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
          <DayPicker
            mode="range"
            numberOfMonths={2}
            // Show the two months ending at the range's "to" date (usually the
            // more relevant, recent end) rather than jumping back to "from".
            defaultMonth={range?.to ? subMonths(range.to, 1) : new Date()}
            selected={range}
            onSelect={setRange}
          />
          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={handleClear}
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"
            >
              All time
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={!range?.from || !range?.to}
              className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
