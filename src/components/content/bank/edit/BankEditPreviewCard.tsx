import { BookOpen, Calendar, Globe, Lock, Users } from "lucide-react";
import type { EditQuestionBankFormData } from "@/src/types";
import type { QuestionBank, BankVisibility } from "@/src/types/api";
import { Badge } from "@/src/components/ui/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/ui/card";

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateString));
}

function getVisibilityBadgeVariant(visibility: BankVisibility) {
  switch (visibility) {
    case "PUBLIC":
      return "success" as const;
    case "SHARED":
      return "info" as const;
    default:
      return "secondary" as const;
  }
}

function renderVisibilityIcon(visibility: BankVisibility) {
  switch (visibility) {
    case "PUBLIC":
      return <Globe className="mr-1 h-3.5 w-3.5" />;
    case "SHARED":
      return <Users className="mr-1 h-3.5 w-3.5" />;
    default:
      return <Lock className="mr-1 h-3.5 w-3.5" />;
  }
}

export default function BankEditPreviewCard({
  bank,
  formData,
}: {
  bank: QuestionBank;
  formData: EditQuestionBankFormData;
}) {
  const previewTags = formData.tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 4);

  return (
    <Card className="transition hover:border-primary hover:shadow-md">
      <CardHeader className="space-y-3">
        <div className="space-y-2">
          <CardTitle>{formData.name || bank.name}</CardTitle>
          <CardDescription>
            {formData.description || "Add a helpful summary so authors know what belongs in this bank."}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">
            <BookOpen className="mr-1 h-3.5 w-3.5" />
            {bank.questionCount || 0} questions
          </Badge>
          <Badge variant={getVisibilityBadgeVariant(formData.visibility)}>
            {renderVisibilityIcon(formData.visibility)}
            {formData.visibility.toLowerCase()}
          </Badge>
        </div>

        {previewTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {previewTags.map((tag) => (
              <span
                key={`${bank.id}-${tag}`}
                className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-inkd"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-inkd">
          <Calendar className="h-4 w-4" />
          Created {formatDate(bank.createdAt)}
        </div>
      </CardContent>
    </Card>
  );
}
