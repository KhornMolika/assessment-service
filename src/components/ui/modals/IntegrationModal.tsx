"use client";

import React, { useState } from "react";
import { Blocks, Copy, Check, Info, X } from "lucide-react";
import { Modal } from "@/src/components/ui/ui/modal";

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="absolute right-2 top-2 rounded-md p-2 text-slate-500 hover:bg-slate-200 transition-colors"
      title="Copy to clipboard"
    >
      {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
    </button>
  );
};

export interface IntegrationModalProps {
  open: boolean;
  onClose: () => void;
  componentName: string;
  componentExport: string;
  description: string;
}

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';

export function IntegrationModal({
  open,
  onClose,
  componentName,
  componentExport,
  description,
}: IntegrationModalProps) {
  const configCode = `/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/assessments',
        destination: 'https://assessment-service.molika.app',
      },
      {
        source: '/assessments/:path*',
        destination: 'https://assessment-service.molika.app/:path*',
      },
    ];
  },
};

export default nextConfig;`;

  const usageCode = `export default function MyPage() {
  return (
    <div className="p-8 h-screen flex flex-col">
      <h1 className="text-2xl font-bold mb-4">Integrate ${componentName}</h1>
      
      {/* 
        Using Next.js Multi Zones, you can embed the application via an iframe 
        pointing to the rewritten path, or simply use <Link href="/assessments"> 
        to navigate the user seamlessly into the zone.
      */}
      <iframe 
        src="/assessments" 
        className="w-full grow border-0 rounded-xl shadow-sm"
        title="${componentName} Integration"
      />
    </div>
  );
}`;


  return (
    <Modal open={open} onClose={onClose} className="max-w-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
      {/* Fixed Header */}
      <div className="flex items-center justify-between border-b px-6 py-4 bg-white shrink-0">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-900">
            <Blocks className="h-5 w-5 text-primary" />
            Integrate {componentName}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {description}
          </p>
        </div>
        <button 
          onClick={onClose} 
          className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="overflow-y-auto px-6 py-6 space-y-6">
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 h-4 w-4 text-primary" />
            <div className="text-sm text-primary/80">
              <strong>Next.js Multi Zones:</strong> The easiest way to securely embed this component. 
              Requirements: <strong>Next.js</strong> and basic routing configuration.
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-sm text-slate-800">1. Webpack / Next.js Configuration</h4>
          <div className="relative rounded-lg overflow-hidden border border-zinc-800 bg-[#1e1e1e] shadow-lg">
            <div className="flex items-center px-4 py-2 bg-[#2d2d2d] border-b border-zinc-800/50">
              <span className="text-xs font-medium text-zinc-400">next.config.js</span>
            </div>
            <CopyButton text={configCode} />
            <div className="text-[13px] leading-relaxed">
              <SyntaxHighlighter language="javascript" style={vscDarkPlus} customStyle={{ margin: 0, padding: '1rem', background: 'transparent' }}>
                {configCode}
              </SyntaxHighlighter>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-sm text-slate-800">2. Component Usage</h4>
          <div className="relative rounded-lg overflow-hidden border border-zinc-800 bg-[#1e1e1e] shadow-lg">
            <div className="flex items-center px-4 py-2 bg-[#2d2d2d] border-b border-zinc-800/50">
              <span className="text-xs font-medium text-zinc-400">page.tsx</span>
            </div>
            <CopyButton text={usageCode} />
            <div className="text-[13px] leading-relaxed">
              <SyntaxHighlighter language="tsx" style={vscDarkPlus} customStyle={{ margin: 0, padding: '1rem', background: 'transparent' }}>
                {usageCode}
              </SyntaxHighlighter>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
