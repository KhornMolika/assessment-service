"use client";

import { Globe, Menu, Search } from "lucide-react";
import { useSidebar } from "../../context/sidebar-context";

export default function Topbar() {
  const { setSidebarOpen } = useSidebar();
  const user = { name: "Khorn Molika", initials: "KM", locale: "EN" };

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center gap-3 border-b border-bdr bg-card px-4 shadow-sm sm:px-6">
      <button
        onClick={() => setSidebarOpen(true)}
        className="rounded-lg p-2 hover:bg-gray-100 md:hidden"
        aria-label="Open sidebar menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="min-w-0 flex-1">
        <div className="relative w-full max-w-xl">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-inkl" />
          <input
            type="text"
            placeholder="Search banks, descriptions, tags, or visibility..."
            className="w-full rounded-lg border border-border bg-card py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-pm"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <div className="cursor-pointer items-center space-x-1 rounded-full px-3 py-1 transition hover:bg-accl flex">
          <Globe size={16} />
          <span className="text-sm font-medium">{user.locale}</span>
        </div>

        <div className="hidden sm:flex items-center space-x-2 rounded-full px-0 py-1 transition hover:bg-accl sm:px-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-card">
            {user.initials}
          </div>
          <span className="hidden font-medium lg:inline">{user.name}</span>
        </div>
      </div>
    </header>
  );
}
