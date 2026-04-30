"use client";

import Link from "next/link";
import { useState } from "react";
import { Copy, PlayCircle, QrCode, Share2, X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import type { AssessmentCatalogItem } from "@/src/domains/assessment/types/assessment-catalog.types";

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
        className="max-h-[calc(100dvh-2rem)] w-full max-w-2xl overflow-y-auto rounded-[24px] bg-white p-4 shadow-2xl sm:rounded-[28px] sm:p-6 lg:p-8"
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
    assessment.delivery_mode === "SELF_PACED"
      ? `/assessments/${assessment.id}/take`
      : `/assessments/${assessment.id}/join`;
  const previewPath =
    assessment.delivery_mode === "SELF_PACED"
      ? `/assessments/${assessment.id}/self-paced-preview`
      : `/assessments/${assessment.id}/real-time-preview`;
  const hostPath = `/assessments/${assessment.id}/host`;
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
                {assessment.title}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowShareModal(false)}
              className="rounded-full p-2 text-inkd transition hover:bg-muted"
              aria-label="Close share modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {assessment.delivery_mode === "SELF_PACED" ? (
            <div className="mt-6 space-y-6">
              <div className="rounded-3xl border border-border bg-muted/40 p-5">
                <div className="flex flex-col items-center gap-5 text-center">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-inkd ring-1 ring-border">
                    <QrCode className="h-4 w-4 text-primary" />
                    Self-paced access
                  </div>
                  <ShareQr value={shareUrl} title={assessment.title} />
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-primary">{assessment.title}</p>
                    <p className="text-xs uppercase tracking-[0.2em] text-inkd">Join link</p>
                    <div className="max-w-full break-all rounded-xl bg-white px-3 py-2 text-sm text-primary shadow-sm ring-1 ring-border">
                      {shareUrl}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-muted"
                >
                  <Copy className="h-4 w-4" />
                  {copied ? "Copied" : "Copy link"}
                </button>
                <Link
                  href={previewPath}
                  className="inline-flex w-full items-center justify-center rounded-xl border border-primary px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/5"
                >
                  Preview
                </Link>
              </div>

              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Done
              </button>
            </div>
          ) : (
            <div className="mt-6 space-y-6">
              <p className="text-sm leading-6 text-inkd">
                This assessment runs in real time. Choose whether you want to launch the live
                session now or preview the assessment first.
              </p>

              <div className="grid gap-3 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => setShowShareModal(false)}
                  className="min-h-11 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-muted"
                >
                  Cancel
                </button>
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
