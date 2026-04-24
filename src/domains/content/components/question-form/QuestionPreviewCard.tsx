import type { Bank } from "@/src/domains/content/types/bank.types";
import type { Topic } from "@/src/domains/content/types/topic.types";
import type { QuestionFormData } from "@/src/domains/content/types/question-form.types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/shared/components/ui/card";
import { Circle, FileText, GripVertical, Square, Star, Upload } from "lucide-react";

function getOptionLabel(index: number) {
  return String.fromCharCode(65 + index);
}

export default function QuestionPreviewCard({
  banks,
  topics,
  formData,
  title = "Preview",
  description,
}: {
  banks: Bank[];
  topics: Topic[];
  formData: QuestionFormData;
  title?: string;
  description?: string;
}) {
  const selectedBank = banks.find((bank) => bank.id === formData.bank);
  const ownerTopic = topics.find((topic) => topic.id === formData.ownerTopicId);
  const selectedTopics = topics.filter((topic) => formData.topicIds.includes(topic.id));

  const renderPreview = () => {
    switch (formData.questionType) {
      case "Single Choice":
        return (
          <div className="space-y-2">
            {formData.options.map((option, index) => (
              <div key={index} className="flex items-center gap-3 rounded-lg border border-border bg-muted px-4 py-2.75">
                <Circle className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-700">{option || `Option ${getOptionLabel(index)}`}</span>
              </div>
            ))}
          </div>
        );
      case "Multiple Choices":
        return (
          <div className="space-y-2">
            {formData.options.map((option, index) => (
              <div key={index} className="flex items-center gap-3 rounded-lg border border-border bg-muted px-4 py-2.75">
                <Square className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-700">{option || `Option ${getOptionLabel(index)}`}</span>
              </div>
            ))}
          </div>
        );
      case "True/False":
        return (
          <div className="space-y-2">
            {["True", "False"].map((option) => (
              <div key={option} className="flex items-center gap-3 rounded-lg border border-border bg-muted px-4 py-2.75">
                <Circle className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-700">{option}</span>
              </div>
            ))}
          </div>
        );
      case "Short Answer":
        return <input type="text" placeholder="Type your answer here..." disabled className="w-full rounded-lg border border-border bg-muted px-4 py-2.75 text-sm text-gray-400" />;
      case "Essay":
        return <textarea placeholder="Type your answer here..." disabled rows={5} className="w-full resize-none rounded-lg border border-border bg-muted px-4 py-2.75 text-sm text-gray-400" />;
      case "Fill in the Blank":
        return (
          <div className="rounded-lg border border-border bg-muted px-4 py-3">
            <p className="text-sm text-gray-700">
              {formData.fillInBlankText
                ? formData.fillInBlankText.split("_____").map((part, index, parts) => (
                    <span key={index}>
                      {part}
                      {index < parts.length - 1 && <input type="text" disabled className="mx-1 inline-block w-24 border-b-2 border-primary bg-transparent px-2 py-1 text-center" />}
                    </span>
                  ))
                : "Text with blanks will appear here..."}
            </p>
          </div>
        );
      case "Matching":
        return (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-semibold text-inkd">Column A</p>
              <div className="space-y-2">
                {formData.matchingPairs.map((pair, index) => (
                  <div key={index} className="rounded border border-border bg-muted px-3 py-2.75 text-sm text-gray-700">
                    {pair.left || `Item ${index + 1}`}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold text-inkd">Column B</p>
              <div className="space-y-2">
                {formData.matchingPairs.map((pair, index) => (
                  <div key={index} className="rounded border border-border bg-muted px-3 py-2.75 text-sm text-gray-700">
                    {pair.right || `Item ${index + 1}`}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case "Ordering":
        return (
          <div className="space-y-2">
            {formData.orderItems.map((item, index) => (
              <div key={index} className="flex items-center gap-2 rounded-lg border border-border bg-muted px-4 py-2.75">
                <GripVertical className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-700">{item || `Item ${index + 1}`}</span>
              </div>
            ))}
          </div>
        );
      case "Rating Scale":
        return (
          <div className="rounded-lg border border-border bg-muted px-4 py-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs text-inkd">{formData.ratingLabels.min}</span>
              <span className="text-xs text-inkd">{formData.ratingLabels.max}</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              {Array.from({ length: formData.ratingScale }, (_, index) => (
                <Star key={index} className="h-6 w-6 text-gray-300" />
              ))}
            </div>
          </div>
        );
      case "File Upload":
        return (
          <div className="rounded-lg border-2 border-dashed border-border bg-muted px-6 py-8">
            <div className="flex flex-col items-center justify-center space-y-3 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200">
                <Upload className="h-6 w-6 text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Click to upload or drag and drop</p>
                <p className="mt-1 text-xs text-gray-500">Accepted: {formData.fileUploadTypes.join(", ").toUpperCase()}</p>
                <p className="text-xs text-gray-500">Max {formData.fileUploadMaxFiles} {formData.fileUploadMaxFiles === 1 ? "file" : "files"} | Up to {formData.fileUploadMaxSize}MB</p>
              </div>
              {formData.fileUploadInstructions && (
                <div className="w-full border-t border-border pt-3">
                  <p className="text-xs text-gray-600">{formData.fileUploadInstructions}</p>
                </div>
              )}
            </div>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted px-4 py-3 text-sm text-inkd">
            <FileText className="h-4 w-4" />
            Preview is not available for this type yet.
          </div>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="mb-2 flex items-start gap-2">
            <span className="text-sm font-semibold text-primary">Q.</span>
            <p className="flex-1 text-sm text-primary">{formData.questionText || "Your question will appear here..."}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-inkd">
            <span>{formData.points} {Number(formData.points) === 1 ? "point" : "points"}</span>
            <span>{selectedBank?.name ?? "No bank assigned"}</span>
            <span>{ownerTopic?.name ?? "No owner topic"}</span>
            {selectedTopics.map((topic) => (
              <span key={topic.id} className="rounded-full bg-accp px-2.5 py-1 font-semibold text-pl">
                {topic.name}
              </span>
            ))}
          </div>
        </div>
        {renderPreview()}
      </CardContent>
    </Card>
  );
}

