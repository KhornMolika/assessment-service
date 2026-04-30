"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import type { LucideIcon } from "lucide-react";
import { useGlobalTopicFilter } from "@/src/shared/hooks/use-global-topic-filter";

export type SidebarNavItem = {
  name: string;
  href: string;
  icon: LucideIcon;
};

export default function SidebarNavLinks({
  items,
  collapsed,
  onNavigate,
}: {
  items: SidebarNavItem[];
  collapsed: boolean;
  onNavigate: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { getHrefWithSelectedTopic } = useGlobalTopicFilter();
  const links = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        hrefWithTopic: getHrefWithSelectedTopic(item.href),
      })),
    [getHrefWithSelectedTopic, items],
  );

  useEffect(() => {
    links.forEach((item) => {
      router.prefetch(item.hrefWithTopic);
    });
  }, [links, router]);

  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      {links.map((item) => (
        <Link
          key={item.name}
          href={item.hrefWithTopic}
          onClick={onNavigate}
          className={`flex items-center rounded py-3 font-medium transition ${
            collapsed ? "justify-center px-0" : "px-3"
          } ${
            isActive(item.href)
              ? "bg-white/10 text-white"
              : "text-white/70 hover:bg-white/5"
          }`}
          title={collapsed ? item.name : undefined}
        >
          <item.icon size={20} />
          {!collapsed && <span className="ml-2">{item.name}</span>}
        </Link>
      ))}
    </>
  );
}
