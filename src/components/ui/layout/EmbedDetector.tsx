"use client";

import { useEffect } from "react";

export default function EmbedDetector() {
  useEffect(() => {
    // Check if we are inside an iframe
    if (typeof window !== "undefined" && window.self !== window.top) {
      document.body.classList.add("embed-mode");

      const handleMessage = (event: MessageEvent) => {
        if (event.data?.type === "SYNC_THEME" && event.data.theme) {
          Object.entries(event.data.theme).forEach(([key, value]) => {
            document.documentElement.style.setProperty(key, value as string);
          });
        }
      };

      window.addEventListener("message", handleMessage);

      // Notify parent that we are ready to receive theme
      window.parent.postMessage({ type: "EMBED_READY" }, "*");

      return () => window.removeEventListener("message", handleMessage);
    }
  }, []);

  return null;
}
