"use client";

import { createContext, useContext, useMemo, useState } from "react";

interface SidebarContextType {
  sidebarOpen: boolean;
  setSidebarOpen: (val: boolean) => void;
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | null>(null);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const value = useMemo(
    () => ({ sidebarOpen, setSidebarOpen, collapsed, setCollapsed }),
    [collapsed, sidebarOpen],
  );

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) throw new Error("useSidebar must be used within SidebarProvider");
  return context;
}
