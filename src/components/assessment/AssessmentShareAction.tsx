"use client";

import Link from "next/link";
import { useState } from "react";
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

  return (
    <>
      <button
        type="button"
        onClick={() => setShowShareModal(true)}
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

              <div className="grid grid-cols-4 gap-2">
                <a
                  href={`fb-messenger://share/?link=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center gap-1 rounded-xl border border-border p-3 transition hover:bg-muted"
                >
                  <svg viewBox="0 0 24 24" className="h-6 w-6 text-[#00B2FF]" fill="currentColor">
                    <path d="M12 2C6.477 2 2 6.145 2 11.26c0 2.925 1.503 5.534 3.86 7.272V22l3.522-1.937c.833.23 1.714.356 2.618.356 5.523 0 10-4.145 10-9.26S17.523 2 12 2zm1.093 12.35l-2.793-2.984-5.46 2.984 6.012-6.38 2.89 2.983 5.358-2.983-6.007 6.38z" />
                  </svg>
                  <span className="text-[10px] font-semibold text-inkd">Messenger</span>
                </a>
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
                  href={`https://wa.me/?text=${encodeURIComponent(`Join my assessment: ${shareUrl}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center gap-1 rounded-xl border border-border p-3 transition hover:bg-muted"
                >
                  <svg viewBox="0 0 24 24" className="h-6 w-6 text-[#25D366]" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  <span className="text-[10px] font-semibold text-inkd">WhatsApp</span>
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`Join my assessment: ${assessment.name}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center gap-1 rounded-xl border border-border p-3 transition hover:bg-muted"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5 text-inkd" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  <span className="text-[10px] font-semibold text-inkd">X</span>
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
            <div className="mt-6 space-y-6">
              <p className="text-sm leading-6 text-inkd">
                This assessment runs in real time. Choose whether you want to launch the live
                session now or preview the assessment first.
              </p>

              <div className="grid gap-3 sm:grid-cols-3">
                <Button
                  type="button"
                  onClick={() => setShowShareModal(false)}
                  className="min-h-11 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-muted" variant="secondary"
                >
                  Cancel
                </Button>
                <Link
                  href={previewPath}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-primary px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/5 lg:col-span-2"
                >
                  Preview
                </Link>
                <Link
                  href={hostPath}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 lg:col-span-2"
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
