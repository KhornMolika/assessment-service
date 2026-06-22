import type { QuestionBank } from "@/src/types/api";
import type { Topic } from "@/src/types/topic.types";
import type { QuestionFormData, QuestionFormType } from "@/src/types/question-form.types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/ui/card";
import { Label } from "@/src/components/ui/ui/label";
import { Select } from "@/src/components/ui/ui/select";
import { Textarea } from "@/src/components/ui/ui/textarea";
import { Input } from "@/src/components/ui/ui/input";
import { Settings2, Database, FolderTree, Star, Hash } from "lucide-react";

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
  banks,
  topics,
  formData,
  onChange,
  title = "Question Details",
  description,
}: QuestionDetailsCardProps) {
  return (
    <Card className="border-slate-200/60 shadow-sm overflow-hidden bg-white/50 backdrop-blur-sm transition-all hover:shadow-md">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100">
        <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
          <Settings2 className="h-5 w-5 text-yellow-500" />
          {title}
        </CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="space-y-2">
          <Label htmlFor="questionText" className="block text-sm font-bold text-slate-800">
            Question Text <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="questionText"
            placeholder="What is the capital of France?"
            value={formData.questionText}
            onChange={(event) => onChange("questionText", event.target.value)}
            rows={4}
            required
            className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-base text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-sm"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 p-5 bg-slate-50/50 rounded-2xl border border-slate-100">
          {/* Row 1: Topic | Question Type */}
          <div className="space-y-2">
            <Label htmlFor="questionType" className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-wider">
              <Settings2 className="h-4 w-4 text-slate-400" />
              Question Type <span className="text-red-500">*</span>
            </Label>
            <Select
              id="questionType"
              value={formData.questionType}
              onChange={(event) => onChange("questionType", event.target.value as QuestionFormType)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              {questionTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </Select>
          </div>

          {/* Row 2: Difficulty | Points */}
          <div className="space-y-2">
            <Label htmlFor="difficulty" className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-wider">
              <Star className="h-4 w-4 text-yellow-500" />
              Difficulty
            </Label>
            <Select
              id="difficulty"
              value={formData.difficulty}
              onChange={(event) => onChange("difficulty", event.target.value as QuestionFormData["difficulty"])}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </Select>
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
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
