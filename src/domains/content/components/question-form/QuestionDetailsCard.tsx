import type { Bank } from "@/src/domains/content/types/bank.types";
import type {
  QuestionFormData,
  QuestionFormType,
} from "@/src/domains/content/types/question-form.types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/shared/components/ui/card";

const questionTypes: QuestionFormType[] = [
  "Single Choice",
  "Multiple Choices",
  "True/False",
  "Short Answer",
  "Essay",
  "Fill in the Blank",
  "Matching",
  "Ordering",
  "Rating Scale",
  "File Upload",
];

export default function QuestionDetailsCard({
  banks,
  formData,
  onChange,
  title = "Question Details",
  description,
}: {
  banks: Bank[];
  formData: QuestionFormData;
  onChange: <K extends keyof QuestionFormData>(
    field: K,
    value: QuestionFormData[K],
  ) => void;
  title?: string;
  description?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label htmlFor="questionText" className="mb-2 block text-sm font-semibold text-primary">
            Question Text *
          </label>
          <textarea
            id="questionText"
            placeholder="Enter your question here..."
            value={formData.questionText}
            onChange={(event) => onChange("questionText", event.target.value)}
            rows={4}
            required
            className="w-full resize-none rounded-lg border border-border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pm"
          />
        </div>

        <div>
          <label htmlFor="questionType" className="mb-2 block text-sm font-semibold text-primary">
            Question Type *
          </label>
          <select
            id="questionType"
            value={formData.questionType}
            onChange={(event) =>
              onChange("questionType", event.target.value as QuestionFormType)
            }
            className="w-full rounded-lg border border-border bg-card px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pm"
          >
            {questionTypes.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="bank" className="mb-2 block text-sm font-semibold text-primary">
            Question Bank
          </label>
          <select
            id="bank"
            value={formData.bank}
            onChange={(event) => onChange("bank", event.target.value)}
            className="w-full rounded-lg border border-border bg-card px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pm"
          >
            <option value="">Select a bank...</option>
            {banks.map((bank) => (
              <option key={bank.id} value={bank.id}>
                {bank.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="difficulty" className="mb-2 block text-sm font-semibold text-primary">
              Difficulty
            </label>
            <select
              id="difficulty"
              value={formData.difficulty}
              onChange={(event) =>
                onChange("difficulty", event.target.value as QuestionFormData["difficulty"])
              }
              className="w-full rounded-lg border border-border bg-card px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pm"
            >
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </div>

          <div>
            <label htmlFor="points" className="mb-2 block text-sm font-semibold text-primary">
              Points *
            </label>
            <input
              id="points"
              type="number"
              min="0"
              value={formData.points}
              onChange={(event) => onChange("points", event.target.value)}
              className="w-full rounded-lg border border-border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pm"
            />
          </div>
        </div>

        <div>
          <label htmlFor="tags" className="mb-2 block text-sm font-semibold text-primary">
            Tags
          </label>
          <input
            id="tags"
            type="text"
            placeholder="e.g. Algebra, Equations, Chapter 3"
            value={formData.tags}
            onChange={(event) => onChange("tags", event.target.value)}
            className="w-full rounded-lg border border-border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pm"
          />
          <p className="mt-1 text-xs text-inkd">Separate tags with commas</p>
        </div>

        <div>
          <label htmlFor="language" className="mb-2 block text-sm font-semibold text-primary">
            Language
          </label>
          <select
            id="language"
            value={formData.language}
            onChange={(event) =>
              onChange("language", event.target.value as QuestionFormData["language"])
            }
            className="w-full rounded-lg border border-border bg-card px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pm"
          >
            <option>English (EN)</option>
            <option>Khmer (KH)</option>
          </select>
        </div>
      </CardContent>
    </Card>
  );
}

