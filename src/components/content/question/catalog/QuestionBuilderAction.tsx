"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import { Button } from "@/src/components/ui/ui/button";
import { IntegrationModal } from "@/src/components/ui/modals/IntegrationModal";

export default function QuestionBuilderAction() {
  const [integrationOpen, setIntegrationOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        onClick={() => setIntegrationOpen(true)}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-primary transition hover:bg-muted sm:w-auto" variant="secondary"
      >
        <Copy className="h-4 w-4" />
        Integrate Builder
      </Button>

      <IntegrationModal
        open={integrationOpen}
        onClose={() => setIntegrationOpen(false)}
        componentName="Questions Catalog"
        componentExport="QuestionsCatalog"
        description="Embed the Questions catalog into your application."
        embedPath="/embed/questions"
      />
    </>
  );
}
