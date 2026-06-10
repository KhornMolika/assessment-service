import type { Bank } from "@/src/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/ui/card";

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateString));
}

function getVisibilityLabel(visibility: Bank["visibility"]) {
  switch (visibility) {
    case "PUBLIC":
      return "Public";
    case "ORG":
      return "Organization";
    default:
      return "Private";
  }
}

export default function BankMetadataCard({ bank }: { bank: Bank }) {
  const rows = [
    { label: "Name", value: bank.name },
    { label: "Description", value: bank.description },
    { label: "Question count", value: String(bank.question_count) },
    { label: "Visibility", value: getVisibilityLabel(bank.visibility) },
    { label: "Created", value: formatDate(bank.created_at) },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bank metadata</CardTitle>
        <CardDescription>
          A quick overview before authors jump into question maintenance.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex flex-col gap-1 border-b border-gray-100 py-3 last:border-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
            >
              <span className="text-sm text-inkd">{row.label}</span>
              <span className="text-sm font-semibold text-primary sm:max-w-sm sm:text-right">{row.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
