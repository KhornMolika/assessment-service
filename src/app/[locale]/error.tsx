"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertOctagon, RefreshCcw, Home } from "lucide-react";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center p-4 sm:p-8">
      <div className="relative w-full max-w-lg overflow-hidden rounded-[2rem] border border-red-100 bg-white p-8 shadow-2xl shadow-red-500/5 sm:p-12">
        {/* Decorative background blurs */}
        <div className="absolute -right-24 -top-24 h-48 w-48 rounded-full bg-red-50 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-orange-50 blur-3xl" />
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-red-50 to-red-100/50 text-red-500 shadow-inner ring-1 ring-red-100/50">
            <AlertOctagon className="h-12 w-12 stroke-[1.5]" />
          </div>
          
          <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Oops! Something went wrong.
          </h1>
          
          <p className="mb-8 text-base leading-relaxed text-slate-500 sm:text-lg">
            {/* eslint-disable-next-line react/no-unescaped-entities */}
            We encountered an unexpected error while trying to load this page. Don't worry, our system has been notified of the issue.
          </p>

          {error.digest && (
            <div className="mb-8 w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-left">
               <p className="text-xs font-medium text-slate-400">Error reference code:</p>
               <p className="mt-1 font-mono text-xs text-slate-600">{error.digest}</p>
            </div>
          )}

          <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
            <button 
              onClick={() => unstable_retry()} 
              className="group relative inline-flex h-14 w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-slate-900 px-8 font-bold text-white transition-all hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-900/20 active:scale-[0.98] sm:w-auto"
            >
              <RefreshCcw className="h-5 w-5 transition-transform duration-500 group-hover:-rotate-180" />
              Try again
            </button>
            <Link
              href="/"
              className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-8 font-bold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98] sm:w-auto"
            >
              <Home className="h-5 w-5" />
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
