"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export type SidebarNavItem = {
  name: string;
  href: string;
  hrefWithTopic: string;
  icon: LucideIcon;
};

export default function SidebarNavLinks({
  items,
  collapsed,
  activePathname,
  currentPathname,
  optimisticPathname,
  onIntent,
  onNavigate,
}: {
  items: SidebarNavItem[];
  collapsed: boolean;
  activePathname: string;
  currentPathname: string;
  optimisticPathname: string | null;
  onIntent: (href: string) => void;
  onNavigate: (pathname: string) => void;
}) {
  const isActive = (href: string) =>
    href === "/"
      ? activePathname === "/"
      : activePathname === href || activePathname.startsWith(`${href}/`);
  const getPathnameFromHref = (href: string) => href.split("?")[0] || "/";

  return (
    <>
      {items.map((item) => {
        const itemPathname = getPathnameFromHref(item.hrefWithTopic);
        const active = isActive(item.href);
        const pending = optimisticPathname === itemPathname && currentPathname !== itemPathname;

        return (
          <Link
            key={item.name}
            href={item.hrefWithTopic}
            prefetch={true}
            onMouseEnter={() => onIntent(item.hrefWithTopic)}
            onFocus={() => onIntent(item.hrefWithTopic)}
            onClick={() => {
              onNavigate(itemPathname);
            }}
            className={`relative flex items-center rounded py-3 font-medium transition ${
              collapsed ? "justify-center px-0" : "px-3"
            } ${
              active
                ? "bg-white/10 text-white"
                : "text-white/70 hover:bg-white/5"
            } ${pending ? "bg-white/10 text-white" : ""}`}
            title={collapsed ? item.name : undefined}
            aria-current={active ? "page" : undefined}
          >
            <item.icon size={20} />
            {!collapsed && <span className="ml-2">{item.name}</span>}
          </Link>
        );
      })}
    </>
  );
}
