import React from "react";

export default function EmbeddedLayout({ children }: { children: React.ReactNode }) {
  // A clean layout without the workspace sidebar or top header
  return (
    <div className="w-full min-h-screen bg-transparent p-4 sm:p-6 lg:p-8">
      {children}
    </div>
  );
}
