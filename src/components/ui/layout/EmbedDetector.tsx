"use client";

import { useEffect } from "react";

export default function EmbedDetector() {
  useEffect(() => {
    // Check if we are inside an iframe
    if (typeof window !== "undefined" && window.self !== window.top) {
      document.body.classList.add("embed-mode");
    }
  }, []);

  return null;
}
