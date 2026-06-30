"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import { Button } from "@/src/components/ui/ui/button";
import { Modal } from "@/src/components/ui/ui/modal";
import { ShareAnswerSheetPanel } from "../SessionShared";

export function ShareModal({
  title,
  shareUrl,
}: {
  title: string;
  shareUrl: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button 
        onClick={() => setOpen(true)} 
        variant="outline" 
        size="sm" 
        className="h-8 gap-2 rounded-full border-border bg-white/90 px-4 text-xs font-bold text-primary shadow-sm transition hover:bg-white"
      >
        <Share2 className="h-3.5 w-3.5" />
        Share
      </Button>
      
      <Modal 
        open={open} 
        onClose={() => setOpen(false)} 
        className="max-w-2xl bg-transparent p-0 shadow-none border-0"
      >
        <ShareAnswerSheetPanel
          enabled={true}
          title={title}
          description="Share your beautiful result card with others."
          shareUrl={shareUrl}
        />
      </Modal>
    </>
  );
}
