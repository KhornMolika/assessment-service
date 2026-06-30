"use client";

import { useEffect } from "react";

export default function EmbedDetector() {
  useEffect(() => {
    // Check if we are inside an iframe
    if (typeof window !== "undefined" && window.self !== window.top) {
      document.body.classList.add("embed-mode");
      document.documentElement.classList.add("embed-mode");

      const handleMessage = (event: MessageEvent) => {
        if (event.data?.type === "SYNC_THEME") {
          if (event.data.mode) {
            if (event.data.mode === "dark") {
              document.documentElement.classList.add("dark");
            } else {
              document.documentElement.classList.remove("dark");
            }
          }

          if (event.data.theme) {
            Object.entries(event.data.theme).forEach(([key, value]) => {
              document.documentElement.style.setProperty(key, value as string);
            });
          }
          
          if (event.data.css) {
            let styleEl = document.getElementById("dynamic-embed-css");
            if (!styleEl) {
              styleEl = document.createElement("style");
              styleEl.id = "dynamic-embed-css";
              document.head.appendChild(styleEl);
            }
            styleEl.innerHTML = event.data.css;
          }
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
