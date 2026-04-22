import type { Bank } from "@/src/domains/content/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/shared/components/ui/card";

export default function QuestionBankTaxonomyCard({ bank }: { bank: Bank }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Taxonomy</CardTitle>
        <CardDescription>
          Use tags to organize content across teams and filters.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {bank.tags.map((tag) => (
            <span
              key={`${bank.id}-${tag}`}
              className="rounded-lg bg-[#D8F3DC] px-4 py-2 text-sm font-medium text-primary"
            >
              {tag}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
