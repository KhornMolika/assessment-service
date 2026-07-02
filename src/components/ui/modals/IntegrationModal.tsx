"use client";

import React, { useState } from "react";
import { Blocks, Copy, Check, Info, X, AlertTriangle } from "lucide-react";
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
  embedPath?: string;
}

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';

export function IntegrationModal({
  open,
  onClose,
  componentName = "Assessment Dashboard",
  description = "Embed the Assessment Service directly into your application using a simple iframe.",
  embedPath = "",
}: IntegrationModalProps) {
  const [integrationMode, setIntegrationMode] = useState<"secure" | "frontend-only">("secure");
  const [activeBackendTab, setActiveBackendTab] = useState<"express" | "nextjs" | "nestjs" | "spring" | "fastapi" | "laravel">("express");
  const [activeFrontendTab, setActiveFrontendTab] = useState<"react" | "angular">("react");

  const dynamicEndpoint = activeBackendTab === "nextjs" 
    ? "/api/embed-token" 
    : "/api/my-backend/get-embed-token";

  const reactCode = [
    '"use client";',
    '',
    'import { useEffect, useRef, useState } from "react";',
    '',
    'export default function MyPage() {',
    '  const iframeRef = useRef<HTMLIFrameElement>(null);',
    '  const [embedToken, setEmbedToken] = useState<string | null>(null);',
    '  const [error, setError] = useState<string | null>(null);',
    '  ',
    '  // 1. Fetch the secure embed token from YOUR backend',
    '  useEffect(() => {',
    '    // Your backend should call POST /api/v1/auth/embed-token',
    '    // using your Client ID and Client Secret, and return the token to this frontend.',
    '    fetch(\'' + dynamicEndpoint + '\')',
    '      .then(async res => {',
    '        if (!res.ok) throw new Error("Failed to fetch token from backend: " + res.statusText);',
    '        return res.json();',
    '      })',
    '      .then(data => setEmbedToken(data.token))',
    '      .catch(err => setError(err.message));',
    '  }, []);',
    '',
    '  useEffect(() => {',
    '    const handleMessage = (e: MessageEvent) => {',
    '      // 3. When the iframe is ready, you can inject your custom theme and styles',
    '      if (e.data?.type === "EMBED_READY") {',
    '        iframeRef.current?.contentWindow?.postMessage({',
    '          type: "SYNC_THEME",',
    '          mode: "light", // set to "dark" for dark mode',
    '          theme: {',
    '            "--primary": "210 100% 50%", // Use your own HSL primary color',
    '            "--radius": "0.5rem"',
    '          },',
    '          css: "\\n            /* Hide specific elements if needed */\\n            /* .page-header-card { display: none !important; } */\\n          "',
    '        }, "*");',
    '      }',
    '    };',
    '    window.addEventListener("message", handleMessage);',
    '    return () => window.removeEventListener("message", handleMessage);',
    '  }, []);',
    '',
    '  if (error) return <div className="p-4 m-4 text-red-600 bg-red-50 border border-red-200 rounded-md">Error: {error}</div>;',
    '  if (!embedToken) return <div>Loading secure assessment environment...</div>;',
    '',
    '  return (',
    '    <div className="w-full h-screen flex flex-col p-8 bg-zinc-50">',
    '      <h1 className="text-2xl font-bold mb-4">Integrate ' + componentName + '</h1>',
    '      ',
    '      {/* 2. Pass the embed token to the iframe via URL parameter */}',
    '      <iframe ',
    '        ref={iframeRef}',
    '        src={\'https://assessment-service.molika.app' + embedPath + '?token=\' + embedToken}',
    '        className="w-full grow border-0 rounded-xl shadow-sm bg-white"',
    '        title="' + componentName + ' Integration"',
    '      />',
    '    </div>',
    '  );',
    '}'
  ].join('\n');

  const backendCode = `// Example using Node.js (Express)
import express from 'express';

const app = express();

app.get('/api/my-backend/get-embed-token', async (req, res) => {
  try {
    const response = await fetch('https://assessment-backend.molika.app/api/v1/auth/embed-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId: process.env.ASSESSMENT_CLIENT_ID,
        clientSecret: process.env.ASSESSMENT_CLIENT_SECRET,
        origin: "https://your-website.com" // Must match your DB allowedOrigins
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || data.error || 'Failed to get token');

    // Return the token to your frontend React code
    res.json({ token: data.access_token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});`;

  const nextjsCode = `// app/api/embed-token/route.ts (Next.js App Router)
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://assessment-backend.molika.app/api/v1/auth/embed-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId: process.env.ASSESSMENT_CLIENT_ID,
        clientSecret: process.env.ASSESSMENT_CLIENT_SECRET,
        origin: "https://your-website.com" // Must match your DB allowedOrigins
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || data.error || 'Failed to get token');

    return NextResponse.json({ token: data.access_token });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}`;

  const nestjsCode = `// app.controller.ts (NestJS)
import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';

@Controller('api/my-backend')
export class AppController {
  @Get('get-embed-token')
  async getEmbedToken() {
    try {
      const response = await fetch('https://assessment-backend.molika.app/api/v1/auth/embed-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: process.env.ASSESSMENT_CLIENT_ID,
          clientSecret: process.env.ASSESSMENT_CLIENT_SECRET,
          origin: "https://your-website.com" // Must match your DB allowedOrigins
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || data.error || 'Failed to get token');

      return { token: data.access_token };
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}`;

  const springCode = [
    '// TokenController.java (Spring Boot)',
    'import org.springframework.beans.factory.annotation.Value;',
    'import org.springframework.web.bind.annotation.GetMapping;',
    'import org.springframework.web.bind.annotation.RestController;',
    'import org.springframework.web.client.RestTemplate;',
    'import org.springframework.http.*;',
    'import java.util.Map;',
    '',
    '@RestController',
    'public class TokenController {',
    '',
    '    @Value("${assessment.client.id}")',
    '    private String clientId;',
    '',
    '    @Value("${assessment.client.secret}")',
    '    private String clientSecret;',
    '',
    '    @GetMapping("/api/my-backend/get-embed-token")',
    '    public ResponseEntity getEmbedToken() {',
    '        RestTemplate restTemplate = new RestTemplate();',
    '        HttpHeaders headers = new HttpHeaders();',
    '        headers.setContentType(MediaType.APPLICATION_JSON);',
    '',
    '        String requestJson = """',
    '            {',
    '              "clientId": "%s",',
    '              "clientSecret": "%s",',
    '              "origin": "https://your-website.com"',
    '            }',
    '            """.formatted(clientId, clientSecret);',
    '',
    '        HttpEntity entity = new HttpEntity(requestJson, headers);',
    '',
    '        try {',
    '            ResponseEntity response = restTemplate.postForEntity(',
    '                "https://assessment-backend.molika.app/api/v1/auth/embed-token", entity, Map.class);',
    '            ',
    '            return ResponseEntity.ok(Map.of("token", ((Map)response.getBody()).get("access_token")));',
    '        } catch (Exception e) {',
    '            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));',
    '        }',
    '    }',
    '}'
  ].join('\n');

  const fastapiCode = `# main.py (FastAPI)
import os
import httpx
from fastapi import FastAPI, HTTPException

app = FastAPI()

@app.get("/api/my-backend/get-embed-token")
async def get_embed_token():
    url = "https://assessment-backend.molika.app/api/v1/auth/embed-token"
    payload = {
        "clientId": os.getenv("ASSESSMENT_CLIENT_ID"),
        "clientSecret": os.getenv("ASSESSMENT_CLIENT_SECRET"),
        "origin": "https://your-website.com"
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=payload)
        
        if response.status_code != 201 and response.status_code != 200:
            raise HTTPException(status_code=500, detail="Failed to get token")
            
        data = response.json()
        return {"token": data.get("access_token")}
`;

  const laravelCode = `// routes/api.php (Laravel)
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route;

Route::get('/my-backend/get-embed-token', function () {
    $response = Http::post('https://assessment-backend.molika.app/api/v1/auth/embed-token', [
        'clientId' => env('ASSESSMENT_CLIENT_ID'),
        'clientSecret' => env('ASSESSMENT_CLIENT_SECRET'),
        'origin' => 'https://your-website.com'
    ]);

    if ($response->failed()) {
        return response()->json(['error' => 'Failed to get token'], 500);
    }

    return response()->json([
        'token' => $response->json('access_token')
    ]);
});
`;

  const angularCode = [
    '// assessment-dashboard.component.ts',
    'import { Component, HostListener, ViewChild, inject, signal, OnInit } from \'@angular/core\';',
    'import { HttpClient } from \'@angular/common/http\';',
    'import { DomSanitizer } from \'@angular/platform-browser\';',
    '',
    '@Component({',
    '  selector: \'app-assessment-dashboard\',',
    '  standalone: true,',
    '  template: `',
    '    @if (!embedUrl()) {',
    '      <div>Loading secure assessment environment...</div>',
    '    } @else {',
    '      <div class="dashboard-container">',
    '        <h1>Integrate ' + componentName + '</h1>',
    '        <iframe ',
    '          #assessmentIframe',
    '          [src]="embedUrl()"',
    '          class="assessment-iframe"',
    '          title="' + componentName + ' Integration"',
    '        ></iframe>',
    '      </div>',
    '    }',
    '  `,',
    '  styles: `',
    '    .dashboard-container { display: flex; flex-direction: column; height: 100vh; padding: 2rem; background: #fafafa; }',
    '    .assessment-iframe { flex-grow: 1; width: 100%; border: none; border-radius: 0.75rem; box-shadow: 0 1px 2px rgba(0,0,0,0.05); background: white; }',
    '  `',
    '})',
    'export class AssessmentDashboardComponent implements OnInit {',
    '  @ViewChild(\'assessmentIframe\') iframeRef: any;',
    '',
    '  private http = inject(HttpClient);',
    '  private sanitizer = inject(DomSanitizer);',
    '  ',
    '  embedUrl = signal(null as any);',
    '',
    '  ngOnInit() {',
    '    // 1. Fetch the secure embed token from YOUR backend',
    '    this.http.get(\'' + dynamicEndpoint + '\').subscribe({',
    '      next: (data: any) => {',
    '        // 2. Pass the embed token to the iframe via URL parameter',
    '        const url = \'https://assessment-service.molika.app' + embedPath + '?token=\' + data.token;',
    '        this.embedUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));',
    '      },',
    '      error: (err) => console.error(\'Failed to get embed token\', err)',
    '    });',
    '  }',
    '',
    '  @HostListener(\'window:message\', [\'$event\'])',
    '  onMessage(e: MessageEvent) {',
    '    // 3. When the iframe is ready, inject custom theme and styles',
    '    if (e.data?.type === \'EMBED_READY\' && this.iframeRef) {',
    '      this.iframeRef.nativeElement.contentWindow?.postMessage({',
    '        type: \'SYNC_THEME\',',
    '        mode: \'light\',',
    '        theme: {',
    '          \'--primary\': \'210 100% 50%\',',
    '          \'--radius\': \'0.5rem\'',
    '        }',
    '      }, \'*\');',
    '    }',
    '  }',
    '}'
  ].join('\n');

  const frontendOnlyReactCode = [
    '"use client";',
    '',
    'import { useEffect, useRef, useState } from "react";',
    '',
    'export default function MyPage() {',
    '  const iframeRef = useRef<HTMLIFrameElement>(null);',
    '  const [embedToken, setEmbedToken] = useState<string | null>(null);',
    '  const [error, setError] = useState<string | null>(null);',
    '  ',
    '  // ⚠️ WARNING: This approach exposes your Client Secret in the browser.',
    '  // Only use this for internal tools or rapid prototyping.',
    '  useEffect(() => {',
    '    fetch(\'https://assessment-backend.molika.app/api/v1/auth/embed-token\', {',
    '      method: \'POST\',',
    '      headers: { \'Content-Type\': \'application/json\' },',
    '      body: JSON.stringify({',
    '        clientId: "YOUR_CLIENT_ID",',
    '        clientSecret: "YOUR_CLIENT_SECRET",',
    '        origin: window.location.origin',
    '      })',
    '    })',
    '      .then(async res => {',
    '        const data = await res.json();',
    '        if (!res.ok) throw new Error(data.message || data.error || "Failed to fetch token");',
    '        return data;',
    '      })',
    '      .then(data => setEmbedToken(data.access_token))',
    '      .catch(err => setError(err.message));',
    '  }, []);',
    '',
    '  useEffect(() => {',
    '    const handleMessage = (e: MessageEvent) => {',
    '      // 3. When the iframe is ready, you can inject your custom theme and styles',
    '      if (e.data?.type === "EMBED_READY") {',
    '        iframeRef.current?.contentWindow?.postMessage({',
    '          type: "SYNC_THEME",',
    '          mode: "light", // set to "dark" for dark mode',
    '          theme: {',
    '            "--primary": "210 100% 50%", // Use your own HSL primary color',
    '            "--radius": "0.5rem"',
    '          },',
    '          css: "\\n            /* Hide specific elements if needed */\\n            /* .page-header-card { display: none !important; } */\\n          "',
    '        }, "*");',
    '      }',
    '    };',
    '    window.addEventListener("message", handleMessage);',
    '    return () => window.removeEventListener("message", handleMessage);',
    '  }, []);',
    '',
    '  if (error) return <div className="p-4 m-4 text-red-600 bg-red-50 border border-red-200 rounded-md">Error: {error}</div>;',
    '  if (!embedToken) return <div>Loading secure assessment environment...</div>;',
    '',
    '  return (',
    '    <div className="w-full h-screen flex flex-col p-8 bg-zinc-50">',
    '      <h1 className="text-2xl font-bold mb-4">Integrate ' + componentName + '</h1>',
    '      ',
    '      <iframe ',
    '        ref={iframeRef}',
    '        src={\'https://assessment-service.molika.app' + embedPath + '?token=\' + embedToken}',
    '        className="w-full grow border-0 rounded-xl shadow-sm bg-white"',
    '        title="' + componentName + ' Integration"',
    '      />',
    '    </div>',
    '  );',
    '}'
  ].join('\n');

  const frontendOnlyAngularCode = [
    '// assessment-dashboard.component.ts',
    'import { Component, HostListener, ViewChild, inject, signal, OnInit } from \'@angular/core\';',
    'import { HttpClient } from \'@angular/common/http\';',
    'import { DomSanitizer } from \'@angular/platform-browser\';',
    '',
    '@Component({',
    '  selector: \'app-assessment-dashboard\',',
    '  standalone: true,',
    '  template: `',
    '    @if (!embedUrl()) {',
    '      <div>Loading secure assessment environment...</div>',
    '    } @else {',
    '      <div class="dashboard-container">',
    '        <h1>Integrate ' + componentName + '</h1>',
    '        <iframe ',
    '          #assessmentIframe',
    '          [src]="embedUrl()"',
    '          class="assessment-iframe"',
    '          title="' + componentName + ' Integration"',
    '        ></iframe>',
    '      </div>',
    '    }',
    '  `,',
    '  styles: `',
    '    .dashboard-container { display: flex; flex-direction: column; height: 100vh; padding: 2rem; background: #fafafa; }',
    '    .assessment-iframe { flex-grow: 1; width: 100%; border: none; border-radius: 0.75rem; box-shadow: 0 1px 2px rgba(0,0,0,0.05); background: white; }',
    '  `',
    '})',
    'export class AssessmentDashboardComponent implements OnInit {',
    '  @ViewChild(\'assessmentIframe\') iframeRef: any;',
    '',
    '  private http = inject(HttpClient);',
    '  private sanitizer = inject(DomSanitizer);',
    '  ',
    '  embedUrl = signal(null as any);',
    '',
    '  ngOnInit() {',
    '    // ⚠️ WARNING: This approach exposes your Client Secret in the browser.',
    '    // Only use this for internal tools or rapid prototyping.',
    '    this.http.post(\'https://assessment-backend.molika.app/api/v1/auth/embed-token\', {',
    '      clientId: "YOUR_CLIENT_ID",',
    '      clientSecret: "YOUR_CLIENT_SECRET",',
    '      origin: window.location.origin',
    '    }).subscribe({',
    '      next: (data: any) => {',
    '        const url = \'https://assessment-service.molika.app' + embedPath + '?token=\' + data.access_token;',
    '        this.embedUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));',
    '      },',
    '      error: (err) => console.error(\'Failed to get embed token\', err)',
    '    });',
    '  }',
    '',
    '  @HostListener(\'window:message\', [\'$event\'])',
    '  onMessage(e: MessageEvent) {',
    '    // 3. When the iframe is ready, inject custom theme and styles',
    '    if (e.data?.type === \'EMBED_READY\' && this.iframeRef) {',
    '      this.iframeRef.nativeElement.contentWindow?.postMessage({',
    '        type: \'SYNC_THEME\',',
    '        mode: \'light\',',
    '        theme: {',
    '          \'--primary\': \'210 100% 50%\',',
    '          \'--radius\': \'0.5rem\'',
    '        }',
    '      }, \'*\');',
    '    }',
    '  }',
    '}'
  ].join('\n');

  const backendSnippets = {
    express: { code: backendCode, label: 'Express', lang: 'typescript', filename: 'server.ts' },
    nextjs: { code: nextjsCode, label: 'Next.js', lang: 'typescript', filename: 'route.ts' },
    nestjs: { code: nestjsCode, label: 'NestJS', lang: 'typescript', filename: 'app.controller.ts' },
    spring: { code: springCode, label: 'Spring', lang: 'java', filename: 'TokenController.java' },
    fastapi: { code: fastapiCode, label: 'FastAPI', lang: 'python', filename: 'main.py' },
    laravel: { code: laravelCode, label: 'Laravel', lang: 'php', filename: 'api.php' },
  };

  const frontendSnippets = {
    react: { code: reactCode, label: 'React / Next.js', lang: 'tsx', filename: 'page.tsx' },
    angular: { code: angularCode, label: 'Angular', lang: 'typescript', filename: 'assessment-dashboard.component.ts' },
  };

  const frontendOnlySnippets = {
    react: { code: frontendOnlyReactCode, label: 'React / Next.js', lang: 'tsx', filename: 'page.tsx' },
    angular: { code: frontendOnlyAngularCode, label: 'Angular', lang: 'typescript', filename: 'assessment-dashboard.component.ts' },
  };

  const activeSnippet = backendSnippets[activeBackendTab];
  const activeFrontendSnippet = integrationMode === 'secure' ? frontendSnippets[activeFrontendTab] : frontendOnlySnippets[activeFrontendTab];

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
        
        <div className="flex bg-slate-100 p-1 rounded-lg w-fit mx-auto">
          <button
            onClick={() => setIntegrationMode('secure')}
            className={"px-4 py-2 text-sm font-medium rounded-md transition-all " + (integrationMode === 'secure' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700')}
          >
            Secure (Recommended)
          </button>
          <button
            onClick={() => setIntegrationMode('frontend-only')}
            className={"px-4 py-2 text-sm font-medium rounded-md transition-all " + (integrationMode === 'frontend-only' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700')}
          >
            Frontend Only
          </button>
        </div>

        {integrationMode === 'secure' ? (
          <>
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
              <div className="flex items-start gap-3">
                <Info className="mt-0.5 h-4 w-4 text-primary" />
                <div className="text-sm text-primary/80">
                  <strong>Iframe Integration:</strong> The easiest and most reliable way to securely embed this component without complex routing configuration.
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-slate-800">Step 1: Backend Setup</h4>
                <p className="text-xs text-slate-500 mb-2">Securely fetch the embed token from our API using your Client Secret.</p>
                
                {/* Custom Tabs */}
                <div className="flex items-center gap-1 mb-2 bg-slate-100 p-1 rounded-lg w-fit">
                  {Object.entries(backendSnippets).map(([key, snippet]) => (
                    <button
                      key={key}
                      onClick={() => setActiveBackendTab(key as any)}
                      className={"px-3 py-1.5 text-xs font-medium rounded-md transition-all " + (activeBackendTab === key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}
                    >
                      {snippet.label}
                    </button>
                  ))}
                </div>

                <div className="relative rounded-lg overflow-hidden border border-zinc-800 bg-[#1e1e1e] shadow-lg">
                  <div className="flex items-center px-4 py-2 bg-[#2d2d2d] border-b border-zinc-800/50">
                    <span className="text-xs font-medium text-zinc-400">{activeSnippet.filename}</span>
                  </div>
                  <CopyButton text={activeSnippet.code} />
                  <div className="text-[13px] leading-relaxed">
                    <SyntaxHighlighter language={activeSnippet.lang} style={vscDarkPlus} customStyle={{ margin: 0, padding: '1rem', background: 'transparent' }}>
                      {activeSnippet.code}
                    </SyntaxHighlighter>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-slate-800 mt-6">Step 2: Frontend Usage</h4>
                <p className="text-xs text-slate-500 mb-2">Call your new backend endpoint and pass the token to the iframe.</p>
                
                {/* Frontend Tabs */}
                <div className="flex items-center gap-1 mb-2 bg-slate-100 p-1 rounded-lg w-fit">
                  {Object.entries(frontendSnippets).map(([key, snippet]) => (
                    <button
                      key={key}
                      onClick={() => setActiveFrontendTab(key as any)}
                      className={"px-3 py-1.5 text-xs font-medium rounded-md transition-all " + (activeFrontendTab === key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}
                    >
                      {snippet.label}
                    </button>
                  ))}
                </div>

                <div className="relative rounded-lg overflow-hidden border border-zinc-800 bg-[#1e1e1e] shadow-lg">
                  <div className="flex items-center px-4 py-2 bg-[#2d2d2d] border-b border-zinc-800/50">
                    <span className="text-xs font-medium text-zinc-400">{activeFrontendSnippet.filename}</span>
                  </div>
                  <CopyButton text={activeFrontendSnippet.code} />
                  <div className="text-[13px] leading-relaxed">
                    <SyntaxHighlighter language={activeFrontendSnippet.lang} style={vscDarkPlus} customStyle={{ margin: 0, padding: '1rem', background: 'transparent' }}>
                      {activeFrontendSnippet.code}
                    </SyntaxHighlighter>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-600" />
                <div className="text-sm text-amber-700">
                  <strong>Warning:</strong> This approach exposes your Client Secret in the browser. Only use this for internal tools, prototypes, or fully trusted environments.
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-slate-800">Frontend Integration</h4>
                <p className="text-xs text-slate-500 mb-2">Fetch the embed token directly from the frontend and pass it to the iframe.</p>
                
                {/* Frontend Only Tabs */}
                <div className="flex items-center gap-1 mb-2 bg-slate-100 p-1 rounded-lg w-fit">
                  {Object.entries(frontendOnlySnippets).map(([key, snippet]) => (
                    <button
                      key={key}
                      onClick={() => setActiveFrontendTab(key as any)}
                      className={"px-3 py-1.5 text-xs font-medium rounded-md transition-all " + (activeFrontendTab === key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}
                    >
                      {snippet.label}
                    </button>
                  ))}
                </div>

                <div className="relative rounded-lg overflow-hidden border border-zinc-800 bg-[#1e1e1e] shadow-lg">
                  <div className="flex items-center px-4 py-2 bg-[#2d2d2d] border-b border-zinc-800/50">
                    <span className="text-xs font-medium text-zinc-400">{activeFrontendSnippet.filename}</span>
                  </div>
                  <CopyButton text={activeFrontendSnippet.code} />
                  <div className="text-[13px] leading-relaxed">
                    <SyntaxHighlighter language={activeFrontendSnippet.lang} style={vscDarkPlus} customStyle={{ margin: 0, padding: '1rem', background: 'transparent' }}>
                      {activeFrontendSnippet.code}
                    </SyntaxHighlighter>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
