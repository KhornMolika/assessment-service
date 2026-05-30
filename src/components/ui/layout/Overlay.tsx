"use client";
import { useSidebar } from "@/src/components/ui/layout/sidebar-context";

export default function Overlay() {
  const { sidebarOpen, setSidebarOpen } = useSidebar();

  if (!sidebarOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-40 md:hidden"
      onClick={() => setSidebarOpen(false)}
    />
  );
}
