import type { Bank } from "@/src/domains/content/types/bank.types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/shared/components/ui/card";

export default function QuestionBanksStats({
  largestBank,
  publicBankCount,
  recentlyCreatedCount,
}: {
  largestBank: Bank | undefined;
  publicBankCount: number;
  recentlyCreatedCount: number;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardDescription>Largest bank</CardDescription>
          <CardTitle className="text-3xl">{largestBank?.question_count ?? 0} questions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-inkd">
            {largestBank
              ? `${largestBank.name} is currently the deepest question library.`
              : "No bank data available yet."}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Public visibility</CardDescription>
          <CardTitle className="text-3xl">
            {publicBankCount} bank{publicBankCount === 1 ? "" : "s"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-inkd">
            Public banks are immediately available for broader discovery and reuse.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Recently created</CardDescription>
          <CardTitle className="text-3xl">{recentlyCreatedCount} this month</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-inkd">
            Newly created banks make it easier to spot the latest content libraries.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
