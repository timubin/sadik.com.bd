import React from 'react';

export const SkeletonCard: React.FC = () => (
  <div className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
    <div className="aspect-[4/3] w-full rounded-xl bg-slate-200 dark:bg-slate-800" />
    <div className="mt-4 h-3 w-1/3 rounded bg-slate-200 dark:bg-slate-800" />
    <div className="mt-2 h-4 w-4/5 rounded bg-slate-200 dark:bg-slate-800" />
    <div className="mt-4 h-5 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
    <div className="mt-4 h-9 w-full rounded-xl bg-slate-200 dark:bg-slate-800" />
  </div>
);
