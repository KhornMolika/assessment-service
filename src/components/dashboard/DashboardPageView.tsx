"use client";

import { useEffect, useState } from "react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Link from "next/link";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Plus, Info } from "lucide-react";
import { StateMessage } from "@/src/components/ui/feedback/StateMessage";
import { Card } from "@/src/components/ui/ui/card";

export default function DashboardPageView() {
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(true);

  useEffect(() => {
    async function fetchMetabaseUrl() {
      try {
        const res = await fetch("/api/metabase");
        if (res.status === 501) {
          setIsConfigured(false);
          return;
        }
        if (!res.ok) {
          throw new Error("Failed to fetch dashboard URL");
        }
        const data = await res.json();
        setIframeUrl(data.url);
      } catch (error) {
        console.error("Error fetching Metabase URL:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchMetabaseUrl();
  }, []);

  return (
    <div className="space-y-6 flex flex-col h-full">

      {!isConfigured ? (
        <Card className="p-8 text-center flex flex-col items-center justify-center min-h-[400px]">
          <Info className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Metabase Not Configured</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            {/* eslint-disable-next-line react/no-unescaped-entities */}
            The dashboard is powered by Metabase, but the connection hasn't been configured yet.
            Please follow the setup instructions in the documentation to start your local Metabase server and connect it to your database.
          </p>
        </Card>
      ) : isLoading ? (
        <div className="flex-1 min-h-[600px] flex items-center justify-center border rounded-xl bg-muted/20 animate-pulse">
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      ) : iframeUrl ? (
        <div className="flex-1 w-full min-h-[800px] rounded-xl overflow-hidden border bg-white shadow-sm">
          <iframe
            src={iframeUrl}
            frameBorder="0"
            width="100%"
            height="100%"
            allowTransparency
            className="w-full h-full min-h-[800px]"
          />
        </div>
      ) : (
        <StateMessage
          title="Error loading dashboard"
          description="We couldn't generate a secure URL for the Metabase dashboard."
        />
      )}
    </div>
  );
}
