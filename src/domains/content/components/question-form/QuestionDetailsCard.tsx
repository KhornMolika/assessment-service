import type { Bank } from "@/src/domains/content/types/bank.types";
import type { Topic } from "@/src/domains/content/types/topic.types";
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
  topicSelectionMode?: "single" | "multiple";
};

export default function QuestionDetailsCard({
  banks,
  topics,
  formData,
  onChange,
  title = "Question Details",
  description,
  topicSelectionMode = "multiple",
}: QuestionDetailsCardProps) {
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
            <option value="">No bank assigned</option>
            {banks.map((bank) => (
              <option key={bank.id} value={bank.id}>
                {bank.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-inkd">
            Optional. Questions can be created without a bank.
          </p>
        </div>

        <div>
          <label htmlFor="ownerTopic" className="mb-2 block text-sm font-semibold text-primary">
            Owner Topic *
          </label>
          <select
            id="ownerTopic"
            value={formData.ownerTopicId}
            onChange={(event) => {
              const nextOwnerTopicId = event.target.value;
              const nextTopicIds =
                topicSelectionMode === "single"
                  ? nextOwnerTopicId
                    ? [nextOwnerTopicId]
                    : []
                  : nextOwnerTopicId
                    ? formData.topicIds.includes(nextOwnerTopicId)
                      ? formData.topicIds
                      : [...formData.topicIds, nextOwnerTopicId]
                    : formData.topicIds;

              onChange("ownerTopicId", nextOwnerTopicId);
              onChange("topicIds", nextTopicIds);
            }}
            className="w-full rounded-lg border border-border bg-card px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pm"
          >
            <option value="">Select a topic owner</option>
            {topics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-inkd">
            Assign the primary topic owner for this question.
          </p>
        </div>

        {topicSelectionMode === "multiple" ? (
          <div>
            <div className="mb-2 block text-sm font-semibold text-primary">Topics *</div>
            <div className="grid gap-2 rounded-lg border border-border bg-card p-3">
              {topics.map((topic) => {
                const checked = formData.topicIds.includes(topic.id);

                return (
                  <label
                    key={topic.id}
                    className="flex cursor-pointer items-start gap-3 rounded-lg px-2 py-2 transition hover:bg-muted"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(event) => {
                        const nextTopicIds = event.target.checked
                          ? [...formData.topicIds, topic.id]
                          : formData.topicIds.filter((topicId) => topicId !== topic.id);

                        if (!event.target.checked && formData.ownerTopicId === topic.id) {
                          onChange("ownerTopicId", "");
                        }
                        onChange("topicIds", nextTopicIds);
                      }}
                      className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-pm"
                    />
                    <div>
                      <div className="text-sm font-semibold text-primary">{topic.name}</div>
                      <div className="text-xs text-inkd">{topic.description}</div>
                    </div>
                  </label>
                );
              })}
            </div>
            <p className="mt-1 text-xs text-inkd">Select at least one topic.</p>
          </div>
        ) : null}

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

