"use client";

import { useEffect, useState } from "react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Link from "next/link";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Plus, Info } from "lucide-react";
import { StateMessage } from "@/src/components/ui/feedback/StateMessage";
import { Card } from "@/src/components/ui/ui/card";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";

export default function DashboardPageView() {
  const t = useTranslations("Dashboard");
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(true);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    async function fetchMetabaseUrl() {
      setIsLoading(true);
      try {
        const metabaseTheme = resolvedTheme === "dark" ? "night" : "transparent";
        const res = await fetch(`/api/metabase?theme=${metabaseTheme}`);
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
  }, [resolvedTheme]);

  return (
    <div className="space-y-6 flex flex-col h-full">

      {!isConfigured ? (
        <Card className="p-8 text-center flex flex-col items-center justify-center min-h-[400px]">
          <Info className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">{t("notConfigured")}</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            {t("notConfiguredDesc")}
          </p>
        </Card>
      ) : isLoading ? (
        <div className="flex-1 min-h-[600px] flex items-center justify-center border rounded-xl bg-muted/20 animate-pulse">
          <p className="text-muted-foreground">{t("loading")}</p>
        </div>
      ) : iframeUrl ? (
        <div className="flex-1 w-full min-h-[800px] rounded-xl overflow-hidden border bg-card shadow-sm">
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
          title={t("error")}
          description={t("errorDesc")}
        />
      )}
    </div>
  );
}
