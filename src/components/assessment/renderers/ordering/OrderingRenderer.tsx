import { ArrowDown, ArrowUp, GripVertical } from "lucide-react";
import type { QuestionRendererProps } from "../types";
import { useState, useMemo, useEffect } from "react";

export function OrderingRenderer({
  question,
  value,
  disabled,
  onChange,
}: QuestionRendererProps) {
  // Stable initial shuffle based on question ID to prevent hydration mismatch while still scrambling
  const initialShuffledIds = useMemo(() => {
    const ids = [...question.options].map(o => o.id);
    let hash = 0;
    for (let i = 0; i < question.id.length; i++) {
      hash = question.id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const random = () => {
      const x = Math.sin(hash++) * 10000;
      return x - Math.floor(x);
    };
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }
    return ids;
  }, [question.id, question.options]);

  const orderedIds = Array.isArray(value) && value.length === question.options.length
    ? value
    : initialShuffledIds;

  const orderedOptions = orderedIds
    .map((optionId) => question.options.find((option: any) => option.id === optionId))
    .filter((option): option is NonNullable<typeof option> => Boolean(option));

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!Array.isArray(value) || value.length !== question.options.length) {
      onChange(initialShuffledIds);
    }
  }, [value, question.options.length, initialShuffledIds, onChange]);

  function moveOption(fromIndex: number, toIndex: number) {
    if (disabled || toIndex < 0 || toIndex >= orderedIds.length) return;
    const nextIds = [...orderedIds];
    const [movedId] = nextIds.splice(fromIndex, 1);
    nextIds.splice(toIndex, 0, movedId);
    onChange(nextIds);
  }

  const handleDragStart = (index: number) => {
    if (disabled) return;
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (disabled || draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (disabled || draggedIndex === null || draggedIndex === index) {
      handleDragEnd();
      return;
    }
    moveOption(draggedIndex, index);
    handleDragEnd();
  };

  return (
    <div className="flex flex-1 flex-col w-full rounded-[24px] border border-border/60 bg-white/70 p-6 shadow-sm backdrop-blur-sm sm:p-8">
      <p className="text-base leading-relaxed text-primary/80">
        Drag and drop the items into the correct order.
      </p>
      <div className="mt-6 space-y-3">
        {orderedOptions.map((option, index) => {
          const isDragging = draggedIndex === index;
          const isOver = dragOverIndex === index;

          return (
            <div
              key={option.id}
              draggable={!disabled}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              onDrop={(e) => handleDrop(e, index)}
              className={`group relative flex items-center gap-4 rounded-2xl border-2 bg-white px-5 py-4 transition-all duration-300 ease-out ${
                isDragging
                  ? "border-primary/50 opacity-50 shadow-lg scale-105 z-10"
                  : isOver
                    ? "border-primary bg-primary/[0.03] scale-[1.02] -translate-y-1 shadow-md shadow-primary/10 z-0"
                    : "border-border/60 hover:border-primary/40 hover:shadow-md z-0"
              } ${disabled ? "cursor-not-allowed opacity-70" : "cursor-grab active:cursor-grabbing"}`}
            >
              <div className="flex shrink-0 items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50 text-primary/40 transition-colors group-hover:bg-primary/10 group-hover:text-primary/70">
                  <GripVertical className="h-5 w-5" />
                </div>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white shadow-sm shadow-primary/20">
                  {index + 1}
                </span>
              </div>
              
              <span className="flex-1 text-base font-semibold leading-relaxed text-primary">
                {option.text}
              </span>

              <div className="flex shrink-0 items-center gap-1.5 opacity-0 transition-opacity group-hover:opacity-100 sm:opacity-100">
                <button
                  type="button"
                  disabled={disabled || index === 0}
                  onClick={(e) => { e.stopPropagation(); moveOption(index, index - 1); }}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 text-primary/70 transition-all hover:bg-primary/5 hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label={`Move ${option.text} up`}
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  disabled={disabled || index === orderedOptions.length - 1}
                  onClick={(e) => { e.stopPropagation(); moveOption(index, index + 1); }}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 text-primary/70 transition-all hover:bg-primary/5 hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label={`Move ${option.text} down`}
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
