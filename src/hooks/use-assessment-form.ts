import { useState, useTransition, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { assessmentFormSchema } from "@/src/schemas/assessment-form.schema";
import type {
  AssessmentGradeLabel,
  NewAssessmentFormData,
} from "@/src/types/assessment-form.types";
import { createAssessmentAction, updateAssessmentAction, publishAssessmentAction } from "@/src/lib/actions/assessment.actions";
import { toast } from "sonner";
import { useTopicStore } from "@/src/stores/topic-store";

const defaultFormData: NewAssessmentFormData = {
  name: "",
  type: "QUIZ",
  description: "",
  ownerTopicId: "",
  status: "DRAFT",
  participantIdentity: "EXTERNAL",
  sessionMode: "SELF_PACED",
  questionSelection: "MANUAL",
  selectedBankId: "",
  selectedQuestionIds: [],
  totalQuestions: 10,
  selectionRules: [
    { difficulty: "Easy", count: 3 },
    { difficulty: "Medium", count: 5 },
    { difficulty: "Hard", count: 2 },
  ],
  enableTimeLimit: false,
  timeLimitMinutes: 0,
  startsAt: "",
  endsAt: "",
  passMark: 50,
  shuffleQuestions: true,
  gradeLabels: [
    { grade: "A", minPercent: 90 },
    { grade: "B", minPercent: 80 },
    { grade: "C", minPercent: 70 },
    { grade: "D", minPercent: 60 },
    { grade: "F", minPercent: 0 },
  ],
  showResults: "IMMEDIATELY",
};

const stepValidationFields: Record<1 | 2 | 3, string[]> = {
  1: ["name"],
  2: [
    "sessionMode",
    "questionSelection",
    "participantIdentity",
    "timeLimitMinutes",
    "startsAt",
    "endsAt",
    "passMark",
    "gradeLabels",
    "showResults",
  ],
  3: [
    "selectedBankId",
    "selectedQuestionIds",
    "totalQuestions",
    "selectionRules",
  ],
};

export function useAssessmentForm({
  mode = "create",
  assessmentId,
  initialFormData,
}: {
  mode?: "create" | "edit" | "duplicate";
  assessmentId?: string;
  initialFormData?: NewAssessmentFormData;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const activeTopic = useTopicStore((s) => s.activeTopic);

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [questionSearch, setQuestionSearch] = useState("");
  const [formData, setFormData] = useState<NewAssessmentFormData>(
    initialFormData ?? { ...defaultFormData, ownerTopicId: activeTopic?.id || "" },
  );
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setCurrentStep(1);
    if (mode === "create" && pathname === "/assessments/new") {
      setFormData({ ...defaultFormData, ownerTopicId: activeTopic?.id || "" });
      setQuestionSearch("");
    } else if (initialFormData) {
      setFormData(initialFormData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, mode, assessmentId]);

  // Keep ownerTopicId in sync with activeTopic if it hydrates after mount or changes
  useEffect(() => {
    if (mode === "create" && activeTopic?.id) {
      setFormData((prev) => {
        if (prev.ownerTopicId !== activeTopic.id) {
          return { ...prev, ownerTopicId: activeTopic.id };
        }
        return prev;
      });
    }
  }, [mode, activeTopic?.id]);

  const getStepValidationMessages = (step: 1 | 2 | 3) => {
    const dataToValidate = {
      ...formData,
      ownerTopicId: activeTopic?.id || formData.ownerTopicId || "TEMP_TOPIC" // satisfy schema for missing topic since we handle it externally
    };
    const validationResult = assessmentFormSchema.safeParse(dataToValidate);

    if (validationResult.success) {
      return [];
    }

    const allowedFields = stepValidationFields[step];

    return Array.from(
      new Set(
        validationResult.error.issues
          .filter((issue) =>
            allowedFields.includes(String(issue.path[0] ?? "")),
          )
          .map((issue) => issue.message),
      ),
    );
  };

  const isStepComplete = (step: number) => {
    if (![1, 2, 3].includes(step)) {
      return false;
    }

    return getStepValidationMessages(step as 1 | 2 | 3).length === 0;
  };

  const canContinue = isStepComplete(currentStep);

  const handleChange = <K extends keyof NewAssessmentFormData>(
    field: K,
    value: NewAssessmentFormData[K],
  ) => {
    setFormData((current) => {
      let nextQuestionSelection = current.questionSelection;
      
      // If switching to REAL_TIME, force MANUAL selection
      if (field === "sessionMode" && value === "REAL_TIME") {
        nextQuestionSelection = "MANUAL";
      }

      return {
        ...current,
        [field]: value,
        questionSelection: field === "questionSelection" ? (value as any) : nextQuestionSelection,
      };
    });
  };

  const handleNext = () => {
    if (currentStep >= 4) {
      return;
    }

    if (!canContinue) {
      const messages = getStepValidationMessages(currentStep);
      messages.forEach((msg) => toast.error(msg));
      return;
    }

    setCurrentStep((currentStep + 1) as 1 | 2 | 3);
  };

  const handlePrevious = () => {
    if (currentStep <= 1) {
      return;
    }

    setCurrentStep((currentStep - 1) as 1 | 2 | 3);
  };

  const handleQuestionToggle = (questionId: string) => {
    setFormData((current) => {
      const alreadySelected = current.selectedQuestionIds.includes(questionId);

      return {
        ...current,
        selectedQuestionIds: alreadySelected
          ? current.selectedQuestionIds.filter((id) => id !== questionId)
          : [...current.selectedQuestionIds, questionId],
      };
    });
  };

  const handleSelectionRuleChange = (
    difficulty: "Easy" | "Medium" | "Hard",
    count: number,
  ) => {
    setFormData((current) => ({
      ...current,
      selectionRules: current.selectionRules.map((rule) =>
        rule.difficulty === difficulty ? { ...rule, count } : rule,
      ),
    }));
  };

  const handleGradeLabelChange = (
    index: number,
    field: keyof AssessmentGradeLabel,
    value: string | number,
  ) => {
    setFormData((current) => ({
      ...current,
      gradeLabels: current.gradeLabels.map((label, currentIndex) =>
        currentIndex === index ? { ...label, [field]: value } : label,
      ),
    }));
  };

  const handleAddGradeLabel = () => {
    setFormData((current) => ({
      ...current,
      gradeLabels: [...current.gradeLabels, { grade: "", minPercent: 0 }],
    }));
  };

  const handleRemoveGradeLabel = (index: number) => {
    setFormData((current) => ({
      ...current,
      gradeLabels: current.gradeLabels.filter(
        (_, currentIndex) => currentIndex !== index,
      ),
    }));
  };

  const destination = "/assessments";

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // Prevent accidental auto-saving when pressing Enter on steps 1 and 2
    if (currentStep < 3) {
      return;
    }

    if (!activeTopic && !formData.ownerTopicId) {
      toast.error("Owner topic is required.");
      return;
    }
    
    const submitData = {
      ...formData,
      ownerTopicId: mode === "create" ? (activeTopic?.id || formData.ownerTopicId) : (formData.ownerTopicId || activeTopic?.id)
    };

    if (submitData.questionSelection === "MANUAL" && submitData.selectedQuestionIds.length === 0) {
      toast.error("Select at least one question for manual question selection.");
      return;
    }
    
    const validationResult = assessmentFormSchema.safeParse(submitData);

    if (!validationResult.success) {
      const errorMessages = Array.from(
        new Set(validationResult.error.issues.map((issue) => issue.message)),
      );
      errorMessages.forEach((msg) => toast.error(msg));
      return;
    }

    
    startTransition(async () => {
      let res;
      if (mode === "edit" && assessmentId) {
        res = await updateAssessmentAction(assessmentId, submitData);
      } else {
        res = await createAssessmentAction(submitData.ownerTopicId || "", submitData);
      }
      
      if (!res.success) {
        toast.error(res.error || "Failed to save assessment");
      } else {
        toast.success(mode === "edit" ? "Assessment updated successfully!" : "Assessment created successfully!");
        router.refresh();
        router.push(destination);
      }
    });
  };

  const handlePublish = () => {
    if (!activeTopic && !formData.ownerTopicId) {
      toast.error("Owner topic is required.");
      return;
    }
    
    const submitData = {
      ...formData,
      ownerTopicId: mode === "create" ? (activeTopic?.id || formData.ownerTopicId) : (formData.ownerTopicId || activeTopic?.id)
    };

    if (submitData.questionSelection === "MANUAL" && submitData.selectedQuestionIds.length === 0) {
      toast.error("Select at least one question for manual question selection.");
      return;
    }
    
    const validationResult = assessmentFormSchema.safeParse(submitData);

    if (!validationResult.success) {
      const errorMessages = Array.from(
        new Set(validationResult.error.issues.map((issue) => issue.message)),
      );
      errorMessages.forEach((msg) => toast.error(msg));
      return;
    }

    
    startTransition(async () => {
      let currentAssessmentId = assessmentId;
      
      // If creating new or duplicating and publishing immediately
      if (mode !== "edit" || !currentAssessmentId) {
        const createRes = await createAssessmentAction(submitData.ownerTopicId || "", submitData);
        if (!createRes.success || !createRes.assessment) {
          toast.error(createRes.error || "Failed to create assessment for publishing");
          return;
        }
        currentAssessmentId = (createRes.assessment as any).id;
      } else {
        // If editing existing, save draft first
        const updateRes = await updateAssessmentAction(currentAssessmentId, submitData);
        if (!updateRes.success) {
          toast.error(updateRes.error || "Failed to save assessment before publishing");
          return;
        }
      }
      
      // Now publish
      if (!currentAssessmentId) return;
      const publishRes = await publishAssessmentAction(currentAssessmentId);
      if (!publishRes.success) {
        toast.error(publishRes.error || "Failed to publish assessment");
      } else {
        toast.success("Assessment published successfully!");
        router.refresh();
        router.push(destination);
      }
    });
  };

  return {
    currentStep,
    questionSearch,
    setQuestionSearch,
    formData,
    isPending,
    canContinue,
    handleChange,
    handleNext,
    handlePrevious,
    handleQuestionToggle,
    handleSelectionRuleChange,
    handleGradeLabelChange,
    handleAddGradeLabel,
    handleRemoveGradeLabel,
    handleSubmit,
    handlePublish,
    destination,
    activeTopic
  };
}
