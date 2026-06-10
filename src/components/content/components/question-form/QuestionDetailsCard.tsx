import type { Bank } from "@/src/types/bank.types";
import type { Topic } from "@/src/types/topic.types";
import type {
  QuestionFormData,
  QuestionFormType,
} from "@/src/types/question-form.types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/ui/card";
import { Label } from "@/src/components/ui/ui/label";
import { Select } from "@/src/components/ui/ui/select";
import { Textarea } from "@/src/components/ui/ui/textarea";
import { Input } from "@/src/components/ui/ui/input";

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

export type QuestionDetailsCardProps = {
  banks: Bank[];
  topics: Topic[];
  formData: QuestionFormData;
  onChange: <K extends keyof QuestionFormData>(
    field: K,
    value: QuestionFormData[K],
  ) => void;
  title?: string;
  description?: string;
};

export default function QuestionDetailsCard({
  banks,
  topics,
  formData,
  onChange,
  title = "Question Details",
  description,
}: QuestionDetailsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="questionText" className="mb-2 block text-sm font-semibold text-primary">
            Question Text *
          </Label>
          <Textarea
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
          <Label htmlFor="questionType" className="mb-2 block text-sm font-semibold text-primary">
            Question Type *
          </Label>
          <Select
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
          </Select>
        </div>

        <div>
          <Label htmlFor="bank" className="mb-2 block text-sm font-semibold text-primary">
            Question Bank
          </Label>
          <Select
            id="bank"
            value={formData.bank}
            onChange={(event) => onChange("bank", event.target.value)}
            className="w-full rounded-lg border border-border bg-card px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pm"
          >
            <option value="">No bank assigned</option>
            {banks.map((bank) => (
              <option key={bank.id} value={bank.id}>
                {bank.name}
              </option>
            ))}
          </Select>
          <p className="mt-1 text-xs text-inkd">
            Optional. Questions can be created without a bank.
          </p>
        </div>

        <div>
          <Label htmlFor="ownerTopic" className="mb-2 block text-sm font-semibold text-primary">
            Owner Topic *
          </Label>
          <Select
            id="ownerTopic"
            value={formData.ownerTopicId}
            onChange={(event) => {
              const nextOwnerTopicId = event.target.value;

              onChange("ownerTopicId", nextOwnerTopicId);
              onChange("topicIds", nextOwnerTopicId ? [nextOwnerTopicId] : []);
            }}
            className="w-full rounded-lg border border-border bg-card px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pm"
          >
            <option value="">Select a topic owner</option>
            {topics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.name}
              </option>
            ))}
          </Select>
          <p className="mt-1 text-xs text-inkd">
            Assign the primary topic owner for this question.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="difficulty" className="mb-2 block text-sm font-semibold text-primary">
              Difficulty
            </Label>
            <Select
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
            </Select>
          </div>

          <div>
            <Label htmlFor="points" className="mb-2 block text-sm font-semibold text-primary">
              Points *
            </Label>
            <Input
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
          <Label htmlFor="tags" className="mb-2 block text-sm font-semibold text-primary">
            Tags
          </Label>
          <Input
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
          <Label htmlFor="language" className="mb-2 block text-sm font-semibold text-primary">
            Language
          </Label>
          <Select
            id="language"
            value={formData.language}
            onChange={(event) =>
              onChange("language", event.target.value as QuestionFormData["language"])
            }
            className="w-full rounded-lg border border-border bg-card px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pm"
          >
            <option>English (EN)</option>
            <option>Khmer (KH)</option>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}

