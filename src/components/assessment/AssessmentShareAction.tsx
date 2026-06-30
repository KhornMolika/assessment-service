"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, PlayCircle, QrCode, Share2, X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import type { AssessmentCatalogItem } from "@/src/types/assessment-catalog.types";
import { Button } from "@/src/components/ui/ui/button";

function ShareQr({
  value,
  title,
}: {
  value: string;
  title: string;
}) {
  return (
    <QRCodeSVG
      value={value}
      title={`QR code for ${title}`}
      size={192}
      level="M"
      marginSize={4}
      bgColor="#FFFFFF"
      fgColor="#1B4332"
      className="h-48 w-48 rounded-2xl bg-white p-3 shadow-inner ring-1 ring-black/5"
    />
  );
}

function ModalShell({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[calc(100dvh-2rem)] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-4 shadow-2xl sm:rounded-[28px] sm:p-6 lg:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export default function AssessmentShareAction({
  assessment,
  buttonClassName = "inline-flex items-center gap-1 rounded-md p-2 text-inkd transition hover:bg-muted",
  labelClassName = "text-xs",
}: {
  assessment: AssessmentCatalogItem;
  buttonClassName?: string;
  labelClassName?: string;
}) {
  const router = useRouter();
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const participantPath =
    assessment.settings?.mode === "SELF_PACED"
      ? `/assessments/${assessment.id}/start-self-paced-assessment`
      : `/assessments/${assessment.id}/enter-real-time-assessment`;
  const previewPath = `/assessments/${assessment.id}/preview`;
  const hostPath = `/assessments/${assessment.id}/present-real-time-assessment`;
  const shareUrl =
    typeof window === "undefined"
      ? participantPath
      : `${window.location.origin}${participantPath}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };
  const openFreshPreview = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    setShowShareModal(false);
    router.push(`${previewPath}?run=${Date.now()}`);
  };

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setShowShareModal(true);
        }}
        className={buttonClassName}
      >
        <Share2 className="h-4 w-4" />
        <span className={labelClassName}>Share</span>
      </button>

      {showShareModal ? (
        <ModalShell onClose={() => setShowShareModal(false)}>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
                Share Assessment
              </p>
              <h3 className="mt-2 text-xl font-bold leading-tight text-primary sm:text-2xl">
                {assessment.name}
              </h3>
            </div>
            <Button
              type="button"
              onClick={() => setShowShareModal(false)}
              className="rounded-full p-2 text-inkd transition hover:bg-muted"
              aria-label="Close share modal" variant="secondary"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {assessment.settings?.mode === "SELF_PACED" ? (
            <div className="mt-6 space-y-6">
              <div className="rounded-3xl border border-border bg-muted/40 p-5">
                <div className="flex flex-col items-center gap-5 text-center">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-inkd ring-1 ring-border">
                    <QrCode className="h-4 w-4 text-primary" />
                    Self-paced access
                  </div>
                  <ShareQr value={shareUrl} title={assessment.name || ""} />
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-primary">{assessment.name}</p>
                    <p className="text-xs uppercase tracking-[0.2em] text-inkd">Join link</p>
                    <div className="max-w-full break-all rounded-xl bg-white px-3 py-2 text-sm text-primary shadow-sm ring-1 ring-border">
                      {shareUrl}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`Join my assessment: ${assessment.name}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center gap-1 rounded-xl border border-border p-3 transition hover:bg-muted"
                >
                  <svg viewBox="0 0 24 24" className="h-6 w-6 text-[#229ED9]" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-1.002-1.056-.846-1.653-1.353-2.682-2.03-.88-.58-.31-1.07.156-1.54.122-.124 2.247-2.06 2.288-2.237.005-.022.01-.102-.037-.145-.047-.043-.117-.03-.168-.018-.073.017-1.242.79-3.504 2.316-.33.228-.628.34-.897.334-.296-.006-.867-.167-1.29-.304-.52-.17-1.127-.26-1.085-.548.022-.15.244-.305.666-.465 2.605-1.134 4.34-1.883 5.207-2.246 2.47-1.037 2.983-1.216 3.32-1.223.074-.002.242.017.352.1.092.069.118.164.128.232.012.083.003.187-.015.353z" />
                  </svg>
                  <span className="text-[10px] font-semibold text-inkd">Telegram</span>
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center gap-1 rounded-xl border border-border p-3 transition hover:bg-muted"
                >
                  <svg viewBox="0 0 24 24" className="h-6 w-6 text-[#1877F2]" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span className="text-[10px] font-semibold text-inkd">Facebook</span>
                </a>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <Button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-muted" variant="secondary"
                >
                  <Copy className="h-4 w-4" />
                  {copied ? "Copied" : "Copy link"}
                </Button>
                <Link
                  href={previewPath}
                  onClick={openFreshPreview}
                  className="inline-flex w-full items-center justify-center rounded-xl border border-primary px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/5"
                >
                  Preview
                </Link>
              </div>

              <Button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Done
              </Button>
            </div>
          ) : (
            <div className="mt-6 space-y-5">
              <div className="rounded-3xl border border-primary/10 bg-[linear-gradient(135deg,#F8FCF8_0%,#FFFFFF_100%)] p-5">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/8 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-primary">
                  <PlayCircle className="h-4 w-4" />
                  Real-time session
                </div>
                <p className="mt-4 text-sm leading-6 text-inkd">
                  Launch the host room when you are ready. Participants can join from the live
                  session lobby after it opens.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-[0.8fr_1.2fr]">
                <Button
                  type="button"
                  onClick={() => setShowShareModal(false)}
                  className="min-h-12 rounded-2xl border border-border bg-[#F4F1EA] px-4 py-3 text-sm font-bold text-primary shadow-sm transition hover:bg-[#ECE7DD]" variant="secondary"
                >
                  Cancel
                </Button>
                <Link
                  href={hostPath}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-white shadow-[0_18px_36px_rgba(17,48,35,0.18)] transition hover:bg-[#174735]"
                >
                  <PlayCircle className="h-4 w-4" />
                  Launch
                </Link>
              </div>
            </div>
          )}
        </ModalShell>
      ) : null}
    </>
  );
}
