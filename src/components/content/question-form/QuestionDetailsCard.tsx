import type { QuestionBank } from "@/src/types/api";
import type { Topic } from "@/src/types/topic.types";
import type { QuestionFormData, QuestionFormType } from "@/src/types/question-form.types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/ui/card";
import { Label } from "@/src/components/ui/ui/label";
import { DropdownSelect } from "@/src/components/ui/ui/dropdown-select";
import { Textarea } from "@/src/components/ui/ui/textarea";
import { Input } from "@/src/components/ui/ui/input";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Settings2, Database, FolderTree, Star, Hash, ChevronDown } from "lucide-react";

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
];

export type QuestionDetailsCardProps = {
  banks: QuestionBank[];
  topics: Topic[];
  formData: QuestionFormData;
  onChange: <K extends keyof QuestionFormData>(field: K, value: QuestionFormData[K]) => void;
  title?: string;
  description?: string;
};

export default function QuestionDetailsCard({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  banks,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  topics,
  formData,
  onChange,
  title = "Question Details",
  description,
}: QuestionDetailsCardProps) {
  return (
    <Card className="border-slate-200/60 shadow-sm bg-white/50 backdrop-blur-sm transition-all hover:shadow-md">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100 rounded-t-2xl">
        <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
          <Settings2 className="h-5 w-5 text-yellow-500" />
          {title}
        </CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6">
        {/* Column 1: Question Text */}
        <div className="space-y-2 flex flex-col">
          <Label htmlFor="questionText" className="block text-sm font-bold text-slate-800">
            Question Text <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="questionText"
            placeholder="What is the capital of France?"
            value={formData.questionText}
            onChange={(event) => onChange("questionText", event.target.value)}
            required
            className="w-full flex-1 min-h-50 resize-none rounded-xl border border-slate-200 px-4 py-3 text-base text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-sm"
          />
        </div>

        {/* Column 2: Settings stacked */}
        <div className="flex flex-col gap-6 p-5 bg-slate-50/50 rounded-2xl border border-slate-100">
          <div className="space-y-2">
            <Label htmlFor="questionType" className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-wider">
              <Settings2 className="h-4 w-4 text-slate-400" />
              Question Type <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <DropdownSelect
                value={formData.questionType}
                options={questionTypes.map((type) => ({ value: type, label: type }))}
                onChange={(val) => onChange("questionType", val as QuestionFormType)}
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficulty" className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-wider">
              <Star className="h-4 w-4 text-yellow-500" />
              Difficulty
            </Label>
            <div className="relative">
              <DropdownSelect
                value={formData.difficulty}
                options={[
                  { value: "Easy", label: "Easy" },
                  { value: "Medium", label: "Medium" },
                  { value: "Hard", label: "Hard" },
                ]}
                onChange={(val) => onChange("difficulty", val as QuestionFormData["difficulty"])}
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="points" className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-wider">
              <Hash className="h-4 w-4 text-green-500" />
              Points <span className="text-red-500">*</span>
            </Label>
            <Input
              id="points"
              type="number"
              min="0"
              value={formData.points}
              onChange={(event) => onChange("points", event.target.value)}
              disabled={formData.questionType === "Rating Scale"}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 disabled:opacity-50 disabled:bg-slate-100 disabled:cursor-not-allowed"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
