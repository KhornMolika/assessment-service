import { useMemo, useState } from "react";
import type { QuestionRendererProps } from "../types";
import { GripVertical, X } from "lucide-react";

function isMatchingValue(value: QuestionRendererProps["value"]): value is Record<string, string> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function MatchingRenderer({ question, value, disabled, onChange }: QuestionRendererProps) {
  const raw = question.rawOptions;
  const leftOptions = raw?.leftSide || [];
  const rightOptions = raw?.rightSide || [];
  const selectedPairs = isMatchingValue(value) ? value : {};

  // Stable shuffle for the right options
  const shuffledRightOptions = useMemo(() => {
    const options = [...rightOptions];
    let hash = 0;
    for (let i = 0; i < question.id.length; i++) {
      hash = question.id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const random = () => {
      const x = Math.sin(hash++) * 10000;
      return x - Math.floor(x);
    };
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    return options;
  }, [question.id, rightOptions]);

  const [draggedOptionId, setDraggedOptionId] = useState<string | null>(null);
  const [dragOverLeftId, setDragOverLeftId] = useState<string | null>(null);

  const matchedCount = Object.values(selectedPairs).filter(Boolean).length;
  
  // Find which right options are currently available in the bank
  const assignedRightIds = new Set(Object.values(selectedPairs));
  const availableRightOptions = shuffledRightOptions.filter(
    (opt) => !assignedRightIds.has(opt.id)
  );

  const handleDragStart = (id: string) => {
    if (disabled) return;
    setDraggedOptionId(id);
  };

  const handleDragOver = (e: React.DragEvent, leftId: string | null) => {
    e.preventDefault();
    if (disabled || !draggedOptionId) return;
    setDragOverLeftId(leftId);
  };

  const handleDragEnd = () => {
    setDraggedOptionId(null);
    setDragOverLeftId(null);
  };

  const handleDropToSlot = (e: React.DragEvent, leftId: string) => {
    e.preventDefault();
    if (disabled || !draggedOptionId) return;
    
    // Assign dragged right option to the dropped left slot
    // If the dragged option was already in another slot, remove it from there
    const newPairs = { ...selectedPairs };
    
    // Find if the dragged option was previously assigned
    for (const key of Object.keys(newPairs)) {
      if (newPairs[key] === draggedOptionId) {
        delete newPairs[key];
      }
    }
    
    // If the slot already had an option, it goes back to the bank automatically because it's overwritten
    newPairs[leftId] = draggedOptionId;
    onChange(newPairs);
    handleDragEnd();
  };

  const handleDropToBank = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled || !draggedOptionId) return;
    
    // Remove the dragged option from any slot it was assigned to
    const newPairs = { ...selectedPairs };
    let changed = false;
    for (const key of Object.keys(newPairs)) {
      if (newPairs[key] === draggedOptionId) {
        delete newPairs[key];
        changed = true;
      }
    }
    if (changed) onChange(newPairs);
    handleDragEnd();
  };

  const handleRemoveFromSlot = (leftId: string) => {
    if (disabled) return;
    const newPairs = { ...selectedPairs };
    delete newPairs[leftId];
    onChange(newPairs);
  };

  return (
    <div className="flex flex-1 flex-col w-full space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[20px] border border-border/50 bg-primary/[0.02] px-6 py-4">
        <p className="text-sm font-medium leading-relaxed text-primary/80">
          Match each term on the left by dragging an option from the bank into the corresponding slot.
        </p>
        <div className="flex h-8 items-center justify-center rounded-full bg-primary/10 px-4 text-xs font-bold text-primary">
          {matchedCount}/{leftOptions.length} matched
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left Side: Fixed Prompts with Drop Slots */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-primary/60">Match these terms</h3>
          <div className="space-y-3">
            {leftOptions.map((leftOpt: any, index: number) => {
              const assignedRightId = selectedPairs[leftOpt.id];
              const assignedRightOpt = rightOptions.find((o: any) => o.id === assignedRightId);
              const isOver = dragOverLeftId === leftOpt.id;

              return (
                <div key={leftOpt.id} className="flex flex-col gap-2">
                  <div className="rounded-2xl border-2 border-border/50 bg-white p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-primary/70">
                        {index + 1}
                      </span>
                      <p className="mt-0.5 text-sm font-semibold text-primary">{leftOpt.text}</p>
                    </div>
                  </div>
                  
                  {/* Drop Slot */}
                  <div
                    onDragOver={(e) => handleDragOver(e, leftOpt.id)}
                    onDrop={(e) => handleDropToSlot(e, leftOpt.id)}
                    className={`ml-6 relative flex min-h-[3.5rem] items-center rounded-2xl border-2 transition-all duration-300 ${
                      isOver
                        ? "border-primary border-dashed bg-primary/[0.03] shadow-inner"
                        : assignedRightOpt
                          ? "border-emerald-200 bg-emerald-50 shadow-sm"
                          : "border-border/60 border-dashed bg-muted/20"
                    }`}
                  >
                    {assignedRightOpt ? (
                      <div
                        draggable={!disabled}
                        onDragStart={() => handleDragStart(assignedRightOpt.id)}
                        onDragEnd={handleDragEnd}
                        className={`group flex w-full items-center justify-between gap-3 px-4 py-3 ${disabled ? "cursor-not-allowed opacity-70" : "cursor-grab active:cursor-grabbing"}`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <GripVertical className="h-4 w-4 shrink-0 text-emerald-600/40" />
                          <p className="truncate text-sm font-bold text-emerald-800">{assignedRightOpt.text}</p>
                        </div>
                        {!disabled && (
                          <button
                            type="button"
                            onClick={() => handleRemoveFromSlot(leftOpt.id)}
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-emerald-200 hover:text-emerald-800"
                            aria-label="Remove match"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="flex w-full items-center justify-center py-3 text-xs font-medium uppercase tracking-widest text-primary/30">
                        {isOver ? "Drop here" : "Drag answer here"}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Draggable Answer Bank */}
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-primary/60">Answer Bank</h3>
          <div 
            className="flex-1 rounded-[24px] border-2 border-border/50 bg-primary/[0.02] p-5 shadow-inner transition-colors"
            onDragOver={(e) => handleDragOver(e, "bank")}
            onDrop={handleDropToBank}
          >
            {availableRightOptions.length === 0 ? (
              <div className="flex h-full min-h-[100px] items-center justify-center rounded-2xl border-2 border-dashed border-primary/20 bg-primary/[0.02] text-sm font-bold tracking-wider text-primary/40 uppercase">
                All answers matched!
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {availableRightOptions.map((rightOpt) => {
                  const isDragging = draggedOptionId === rightOpt.id;
                  
                  return (
                    <div
                      key={rightOpt.id}
                      draggable={!disabled}
                      onDragStart={() => handleDragStart(rightOpt.id)}
                      onDragEnd={handleDragEnd}
                      className={`group flex items-center gap-2 rounded-[14px] border-2 border-border/60 bg-white px-4 py-2.5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md ${
                        disabled ? "cursor-not-allowed opacity-70" : "cursor-grab active:cursor-grabbing"
                      } ${isDragging ? "opacity-30 scale-95 border-primary bg-primary/5" : ""}`}
                    >
                      <GripVertical className="h-4 w-4 shrink-0 text-primary/30 transition-colors group-hover:text-primary/60" />
                      <span className="text-sm font-bold text-primary">{rightOpt.text}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
