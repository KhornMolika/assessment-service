"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/src/components/ui/ui/button";

interface ActionMenuProps {
  children: React.ReactNode;
  trigger?: React.ReactNode;
}

export function ActionMenu({ children, trigger }: ActionMenuProps) {
  const [showMenu, setShowMenu] = useState(false);
  const buttonRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, right: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const updatePosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 4,
        right: window.innerWidth - rect.right - window.scrollX,
      });
    }
  };

  useEffect(() => {
    if (showMenu) {
      updatePosition();
      window.addEventListener("resize", updatePosition);
      window.addEventListener("scroll", updatePosition, true);
      return () => {
        window.removeEventListener("resize", updatePosition);
        window.removeEventListener("scroll", updatePosition, true);
      };
    }
  }, [showMenu]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (buttonRef.current && buttonRef.current.contains(event.target as Node)) {
        return;
      }
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMenu = () => {
    if (!showMenu) {
      updatePosition();
    }
    setShowMenu(!showMenu);
  };

  return (
    <>
      {trigger ? (
        <div ref={buttonRef as React.RefObject<HTMLDivElement>} onClick={toggleMenu} className="inline-flex cursor-pointer">
          {trigger}
        </div>
      ) : (
        <Button
          ref={buttonRef as React.RefObject<HTMLButtonElement>}
          onClick={toggleMenu}
          variant="ghost"
          className="flex h-8 w-8 items-center justify-center rounded-full p-0 text-primary transition hover:bg-muted/50"
          aria-label="More actions"
        >
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      )}

      {mounted && showMenu && createPortal(
        <div 
          ref={menuRef}
          style={{ top: position.top, right: position.right }}
          className="absolute z-[9999] w-48 overflow-hidden rounded-xl border border-border bg-card shadow-xl"
          onClick={() => setShowMenu(false)}
        >
          <div className="flex flex-col py-1">
            {children}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
