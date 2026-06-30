import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/ui/card";
import { Label } from "@/src/components/ui/ui/label";
import { Input } from "@/src/components/ui/ui/input";
import { Textarea } from "@/src/components/ui/ui/textarea";
import { Select } from "@/src/components/ui/ui/select";
import { FolderOpen, Settings2 } from "lucide-react";
import { BankVisibility } from "@/src/types/api";

export type BankFormData = {
  name: string;
  description: string;
  tags: string;
  visibility: BankVisibility;
};

export type BankFormDetailsCardProps = {
  formData: BankFormData;
  onChange: <K extends keyof BankFormData>(field: K, value: BankFormData[K]) => void;
  title?: string;
  description?: string;
  disabled?: boolean;
};

export default function BankFormDetailsCard({
  formData,
  onChange,
  title = "Bank Details",
  description,
  disabled = false,
}: BankFormDetailsCardProps) {
  return (
    <Card className="border-slate-200/60 shadow-sm bg-white/50 backdrop-blur-sm transition-all hover:shadow-md">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100 rounded-t-2xl">
        <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
          <FolderOpen className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6">
        {/* Column 1: Basic Info */}
        <div className="space-y-6 flex flex-col">
          <div className="space-y-2">
            <Label htmlFor="bank-name" className="block text-sm font-bold text-slate-800">
              Bank Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="bank-name"
              type="text"
              placeholder="e.g. Mathematics - Grade 11"
              value={formData.name}
              onChange={(event) => onChange("name", event.target.value)}
              required
              disabled={disabled}
              className="w-full rounded-xl border-slate-200 px-4 py-3 text-base text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
            />
          </div>

          <div className="space-y-2 flex-1 flex flex-col">
            <Label htmlFor="bank-description" className="block text-sm font-bold text-slate-800">
              Description
            </Label>
            <Textarea
              id="bank-description"
              placeholder="Briefly describe the type of questions this bank should contain"
              value={formData.description || ""}
              onChange={(event) => onChange("description", event.target.value)}
              disabled={disabled}
              className="w-full flex-1 min-h-[120px] resize-none rounded-xl border-slate-200 px-4 py-3 text-base text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Column 2: Settings */}
        <div className="flex flex-col gap-6 p-5 bg-slate-50/50 rounded-2xl border border-slate-100">
          <div className="space-y-2">
            <Label htmlFor="bank-visibility" className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-wider">
              <Settings2 className="h-4 w-4 text-slate-400" />
              Visibility <span className="text-red-500">*</span>
            </Label>
            <Select
              id="bank-visibility"
              value={formData.visibility}
              onChange={(event) => onChange("visibility", event.target.value as BankVisibility)}
              disabled={disabled}
              className="w-full rounded-xl border-slate-200 px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
            >
              <option value="PRIVATE">Private</option>
              <option value="SHARED">Shared</option>
              <option value="PUBLIC">Public</option>
            </Select>
            <p className="text-xs text-slate-500 mt-1">
              Choose who can discover and reuse this bank once it is published.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bank-tags" className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-wider">
              Tags
            </Label>
            <Input
              id="bank-tags"
              type="text"
              placeholder="e.g. Math, Grade 10, Midterm"
              value={formData.tags}
              onChange={(event) => onChange("tags", event.target.value)}
              disabled={disabled}
              className="w-full rounded-xl border-slate-200 px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
            />
            <p className="text-xs text-slate-500 mt-1">Separate tags with commas.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
