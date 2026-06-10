import type { ReactNode } from "react";
import type {
  MatchingPairFormValue,
  QuestionFormData,
} from "@/src/types/question-form.types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/ui/card";
import { Check, GripVertical, Plus, X } from "lucide-react";
import { Label } from "@/src/components/ui/ui/label";
import { Button } from "@/src/components/ui/ui/button";
import { Select } from "@/src/components/ui/ui/select";
import { Input } from "@/src/components/ui/ui/input";
import { Textarea } from "@/src/components/ui/ui/textarea";

function getOptionLabel(index: number) {
  return String.fromCharCode(65 + index);
}

export default function QuestionTypeSettingsCard({
  formData,
  onChange,
  title = "Type Settings",
  description,
  extraContent,
}: {
  formData: QuestionFormData;
  onChange: <K extends keyof QuestionFormData>(
    field: K,
    value: QuestionFormData[K],
  ) => void;
  title?: string;
  description?: string;
  extraContent?: ReactNode;
}) {
  const updateOption = (index: number, value: string) => {
    const nextOptions = [...formData.options];
    nextOptions[index] = value;
    onChange("options", nextOptions);
  };

  const updateMatchingPair = (
    index: number,
    side: keyof MatchingPairFormValue,
    value: string,
  ) => {
    const nextPairs = [...formData.matchingPairs];
    nextPairs[index] = { ...nextPairs[index], [side]: value };
    onChange("matchingPairs", nextPairs);
  };

  const updateOrderItem = (index: number, value: string) => {
    const nextItems = [...formData.orderItems];
    nextItems[index] = value;
    onChange("orderItems", nextItems);
  };

  const toggleCorrectAnswer = (index: number) => {
    if (formData.questionType === "Single Choice") {
      onChange("correctAnswers", [index]);
      return;
    }

    const nextCorrectAnswers = formData.correctAnswers.includes(index)
      ? formData.correctAnswers.filter((itemIndex) => itemIndex !== index)
      : [...formData.correctAnswers, index];

    onChange("correctAnswers", nextCorrectAnswers.length > 0 ? nextCorrectAnswers : [0]);
  };

  const renderContent = () => {
    switch (formData.questionType) {
      case "Single Choice":
      case "Multiple Choices":
        return (
          <div>
            <Label className="mb-3 block text-sm font-semibold text-primary">Answer Options</Label>
            <p className="mb-3 text-xs text-inkd">
              {formData.questionType === "Single Choice"
                ? "Click the circle to mark the correct answer"
                : "Check all correct answers"}
            </p>
            <div className="space-y-2">
              {formData.options.map((option, index) => {
                const isCorrect = formData.correctAnswers.includes(index);
                const isSingleChoice = formData.questionType === "Single Choice";

                return (
                  <div
                    key={index}
                    className={`flex items-center gap-3 rounded-lg border px-4 py-3 transition ${
                      isCorrect ? "border-acc bg-accp" : "border-border bg-card"
                    }`}
                  >
                    <Button
                      type="button"
                      onClick={() => toggleCorrectAnswer(index)}
                      className={`flex h-5 w-5 shrink-0 items-center justify-center border-2 transition ${
                        isSingleChoice ? "rounded-full" : "rounded"
                      } ${
                        isCorrect
                          ? "border-pl bg-pl"
                          : "border-gray-400 bg-white hover:border-pl"
                      }`}
                    >
                      {isCorrect && <Check className="h-3 w-3 text-white" />}
                    </Button>
                    <span className="w-6 text-sm font-semibold text-primary">
                      {getOptionLabel(index)}
                    </span>
                    <Input
                      type="text"
                      placeholder={`Option ${getOptionLabel(index)}`}
                      value={option}
                      onChange={(event) => updateOption(index, event.target.value)}
                      className={`flex-1 border-none bg-transparent text-sm outline-none ${
                        isCorrect ? "font-medium text-primary" : "text-gray-700"
                      }`}
                    />
                    {formData.options.length > 2 && (
                      <Button
                        type="button"
                        onClick={() => {
                          const nextOptions = formData.options.filter((_, itemIndex) => itemIndex !== index);
                          const nextCorrectAnswers = formData.correctAnswers
                            .filter((itemIndex) => itemIndex !== index)
                            .map((itemIndex) => (itemIndex > index ? itemIndex - 1 : itemIndex));
                          onChange("options", nextOptions);
                          onChange(
                            "correctAnswers",
                            nextCorrectAnswers.length > 0 ? nextCorrectAnswers : [0],
                          );
                        }}
                        className="shrink-0 text-gray-400 transition hover:text-red-500" variant="ghost"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                );
              })}
              <Button
                type="button"
                onClick={() => onChange("options", [...formData.options, ""])}
                className="mt-2 flex items-center gap-2 text-sm font-semibold text-acc transition hover:text-primary" variant="ghost"
              >
                <Plus className="h-4 w-4" />
                Add Option
              </Button>
            </div>
          </div>
        );

      case "True/False":
        return (
          <div>
            <Label className="mb-3 block text-sm font-semibold text-primary">Correct Answer</Label>
            <div className="space-y-2">
              {[
                { label: "True", value: true },
                { label: "False", value: false },
              ].map((option) => {
                const isCorrect = formData.trueFalseAnswer === option.value;

                return (
                  <Button
                    key={option.label}
                    type="button"
                    onClick={() => onChange("trueFalseAnswer", option.value)}
                    className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition ${
                      isCorrect ? "border-acc bg-accp" : "border-border bg-card hover:border-acc"
                    }`}
                  >
                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                        isCorrect ? "border-pl bg-pl" : "border-gray-400 bg-white"
                      }`}
                    >
                      {isCorrect && <Check className="h-3 w-3 text-white" />}
                    </div>
                    <span className={`text-sm font-medium ${isCorrect ? "text-primary" : "text-gray-700"}`}>
                      {option.label}
                    </span>
                  </Button>
                );
              })}
            </div>
          </div>
        );

      case "Short Answer":
        return (
          <div>
            <Label className="mb-3 block text-sm font-semibold text-primary">
              Acceptable Keywords/Answers
            </Label>
            <p className="mb-3 text-xs text-inkd">Add keywords or phrases that should be in the answer</p>
            <div className="space-y-2">
              {formData.shortAnswerKeywords.map((keyword, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    type="text"
                    placeholder={`Keyword ${index + 1}`}
                    value={keyword}
                    onChange={(event) => {
                      const nextKeywords = [...formData.shortAnswerKeywords];
                      nextKeywords[index] = event.target.value;
                      onChange("shortAnswerKeywords", nextKeywords);
                    }}
                    className="flex-1 rounded-lg border border-border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pm"
                  />
                  {formData.shortAnswerKeywords.length > 1 && (
                    <Button
                      type="button"
                      onClick={() =>
                        onChange(
                          "shortAnswerKeywords",
                          formData.shortAnswerKeywords.filter((_, itemIndex) => itemIndex !== index),
                        )
                      }
                      className="text-gray-400 transition hover:text-red-500" variant="ghost"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                onClick={() => onChange("shortAnswerKeywords", [...formData.shortAnswerKeywords, ""])}
                className="flex items-center gap-2 text-sm font-semibold text-acc transition hover:text-primary" variant="ghost"
              >
                <Plus className="h-4 w-4" />
                Add Keyword
              </Button>
            </div>
          </div>
        );

      case "Essay":
        return (
          <div>
            <Label className="mb-3 block text-sm font-semibold text-primary">Grading Guidelines</Label>
            <Textarea
              placeholder="Provide guidelines for grading this essay question..."
              value={formData.explanation}
              onChange={(event) => onChange("explanation", event.target.value)}
              rows={4}
              className="w-full resize-none rounded-lg border border-border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pm"
            />
          </div>
        );

      case "Fill in the Blank":
        return (
          <div className="space-y-4">
            <div>
              <Label className="mb-3 block text-sm font-semibold text-primary">Text with Blanks</Label>
              <p className="mb-3 text-xs text-inkd">Use `_____` to create blanks in your text</p>
              <Textarea
                placeholder="The capital of France is _____"
                value={formData.fillInBlankText}
                onChange={(event) => onChange("fillInBlankText", event.target.value)}
                rows={3}
                className="w-full resize-none rounded-lg border border-border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pm"
              />
            </div>
            <div>
              <Label className="mb-3 block text-sm font-semibold text-primary">Correct Answers for Blanks</Label>
              <div className="space-y-2">
                {formData.fillInBlankAnswers.map((answer, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="w-20 text-sm font-semibold text-primary">Blank {index + 1}:</span>
                    <Input
                      type="text"
                      placeholder="Correct answer"
                      value={answer}
                      onChange={(event) => {
                        const nextAnswers = [...formData.fillInBlankAnswers];
                        nextAnswers[index] = event.target.value;
                        onChange("fillInBlankAnswers", nextAnswers);
                      }}
                      className="flex-1 rounded-lg border border-border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pm"
                    />
                    {formData.fillInBlankAnswers.length > 1 && (
                      <Button
                        type="button"
                        onClick={() =>
                          onChange(
                            "fillInBlankAnswers",
                            formData.fillInBlankAnswers.filter((_, itemIndex) => itemIndex !== index),
                          )
                        }
                        className="text-gray-400 transition hover:text-red-500" variant="ghost"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  onClick={() => onChange("fillInBlankAnswers", [...formData.fillInBlankAnswers, ""])}
                  className="flex items-center gap-2 text-sm font-semibold text-acc transition hover:text-primary" variant="ghost"
                >
                  <Plus className="h-4 w-4" />
                  Add Blank Answer
                </Button>
              </div>
            </div>
          </div>
        );

      case "Matching":
        return (
          <div>
            <Label className="mb-3 block text-sm font-semibold text-primary">Matching Pairs</Label>
            <p className="mb-3 text-xs text-inkd">Create items to match between left and right columns</p>
            <div className="space-y-3">
              {formData.matchingPairs.map((pair, index) => (
                <div key={index} className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="flex flex-1 items-center gap-3">
                    <Input
                      type="text"
                      placeholder={`Left item ${index + 1}`}
                      value={pair.left}
                      onChange={(event) => updateMatchingPair(index, "left", event.target.value)}
                      className="flex-1 rounded-lg border border-border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pm"
                    />
                    <span className="text-inkd">?</span>
                    <Input
                      type="text"
                      placeholder={`Right item ${index + 1}`}
                      value={pair.right}
                      onChange={(event) => updateMatchingPair(index, "right", event.target.value)}
                      className="flex-1 rounded-lg border border-border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pm"
                    />
                  </div>
                  {formData.matchingPairs.length > 2 && (
                    <Button
                      type="button"
                      onClick={() =>
                        onChange(
                          "matchingPairs",
                          formData.matchingPairs.filter((_, itemIndex) => itemIndex !== index),
                        )
                      }
                      className="text-gray-400 transition hover:text-red-500" variant="ghost"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                onClick={() => onChange("matchingPairs", [...formData.matchingPairs, { left: "", right: "" }])}
                className="flex items-center gap-2 text-sm font-semibold text-acc transition hover:text-primary" variant="ghost"
              >
                <Plus className="h-4 w-4" />
                Add Pair
              </Button>
            </div>
          </div>
        );

      case "Ordering":
        return (
          <div>
            <Label className="mb-3 block text-sm font-semibold text-primary">Items to Order</Label>
            <p className="mb-3 text-xs text-inkd">Add items in the correct order</p>
            <div className="space-y-2">
              {formData.orderItems.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-gray-400" />
                  <span className="w-6 text-sm font-semibold text-primary">{index + 1}.</span>
                  <Input
                    type="text"
                    placeholder={`Item ${index + 1}`}
                    value={item}
                    onChange={(event) => updateOrderItem(index, event.target.value)}
                    className="flex-1 rounded-lg border border-border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pm"
                  />
                  {formData.orderItems.length > 2 && (
                    <Button
                      type="button"
                      onClick={() =>
                        onChange(
                          "orderItems",
                          formData.orderItems.filter((_, itemIndex) => itemIndex !== index),
                        )
                      }
                      className="text-gray-400 transition hover:text-red-500" variant="ghost"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                onClick={() => onChange("orderItems", [...formData.orderItems, ""])}
                className="flex items-center gap-2 text-sm font-semibold text-acc transition hover:text-primary" variant="ghost"
              >
                <Plus className="h-4 w-4" />
                Add Item
              </Button>
            </div>
          </div>
        );

      case "Rating Scale":
        return (
          <div className="space-y-4">
            <div>
              <Label className="mb-2 block text-sm font-semibold text-primary">Rating Scale Settings</Label>
              <Select
                value={formData.ratingScale}
                onChange={(event) => onChange("ratingScale", Number(event.target.value))}
                className="w-full rounded-lg border border-border bg-card px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pm"
              >
                <option value={3}>3 Points</option>
                <option value={5}>5 Points</option>
                <option value={7}>7 Points</option>
                <option value={10}>10 Points</option>
              </Select>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label className="mb-2 block text-xs text-inkd">Minimum Label</Label>
                <Input
                  type="text"
                  value={formData.ratingLabels.min}
                  onChange={(event) =>
                    onChange("ratingLabels", { ...formData.ratingLabels, min: event.target.value })
                  }
                  className="w-full rounded-lg border border-border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pm"
                />
              </div>
              <div>
                <Label className="mb-2 block text-xs text-inkd">Maximum Label</Label>
                <Input
                  type="text"
                  value={formData.ratingLabels.max}
                  onChange={(event) =>
                    onChange("ratingLabels", { ...formData.ratingLabels, max: event.target.value })
                  }
                  className="w-full rounded-lg border border-border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pm"
                />
              </div>
            </div>
          </div>
        );

      case "File Upload":
        return (
          <div className="space-y-4">
            <div>
              <Label className="mb-2 block text-sm font-semibold text-primary">Allowed File Types</Label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {[
                  { label: "PDF", value: "pdf" },
                  { label: "Word (DOC, DOCX)", value: "doc" },
                  { label: "Images (JPG, PNG)", value: "image" },
                  { label: "Excel (XLS, XLSX)", value: "excel" },
                  { label: "PowerPoint (PPT, PPTX)", value: "ppt" },
                  { label: "Text (TXT)", value: "txt" },
                ].map((type) => {
                  const isSelected = formData.fileUploadTypes.includes(type.value);

                  return (
                    <Button
                      key={type.value}
                      type="button"
                      onClick={() => {
                        const nextTypes = isSelected
                          ? formData.fileUploadTypes.filter((item) => item !== type.value)
                          : [...formData.fileUploadTypes, type.value];
                        onChange("fileUploadTypes", nextTypes.length > 0 ? nextTypes : ["pdf"]);
                      }}
                      className={`rounded-lg border px-3 py-2 text-left text-xs font-medium transition ${
                        isSelected
                          ? "border-acc bg-accp text-primary"
                          : "border-border bg-card text-gray-700 hover:border-acc"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`flex h-4 w-4 items-center justify-center rounded border-2 ${
                            isSelected ? "border-pl bg-pl" : "border-gray-400"
                          }`}
                        >
                          {isSelected && <Check className="h-3 w-3 text-white" />}
                        </div>
                        {type.label}
                      </div>
                    </Button>
                  );
                })}
              </div>
            </div>

            <div>
              <Label className="mb-2 block text-xs text-inkd">Maximum File Size (MB)</Label>
              <Select
                value={formData.fileUploadMaxSize}
                onChange={(event) => onChange("fileUploadMaxSize", Number(event.target.value))}
                className="w-full rounded-lg border border-border bg-card px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pm"
              >
                <option value={5}>5 MB</option>
                <option value={10}>10 MB</option>
                <option value={25}>25 MB</option>
                <option value={50}>50 MB</option>
                <option value={100}>100 MB</option>
              </Select>
            </div>

            <div>
              <Label className="mb-2 block text-xs text-inkd">Number of Files Allowed</Label>
              <Select
                value={formData.fileUploadMaxFiles}
                onChange={(event) => onChange("fileUploadMaxFiles", Number(event.target.value))}
                className="w-full rounded-lg border border-border bg-card px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pm"
              >
                <option value={1}>1 File</option>
                <option value={2}>2 Files</option>
                <option value={3}>3 Files</option>
                <option value={5}>5 Files</option>
                <option value={10}>10 Files</option>
              </Select>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="space-y-6">
        {renderContent()}
        {extraContent}
      </CardContent>
    </Card>
  );
}



