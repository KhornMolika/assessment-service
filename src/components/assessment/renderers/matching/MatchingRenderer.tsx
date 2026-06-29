import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import type { QuestionRendererProps } from "../types";

function isMatchingValue(value: QuestionRendererProps["value"]): value is Record<string, string> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function MatchingRenderer({ question, value, disabled, onChange }: QuestionRendererProps) {
  const raw = question.rawOptions;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const leftOptions = raw?.leftSide || [];
  const rightOptions = raw?.rightSide || [];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const selectedPairs = isMatchingValue(value) ? value : {};

  // Random shuffle on mount for the right options
  const shuffledRightOptions = useMemo(() => {
    const options = [...rightOptions];
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    return options;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.id, rightOptions]);

  const matchedCount = Object.values(selectedPairs).filter(Boolean).length;

  // --- Coordinate Tracking ---
  const containerRef = useRef<HTMLDivElement>(null);
  const leftRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const rightRefs = useRef<Record<string, HTMLDivElement | null>>({});
  
  const [nodes, setNodes] = useState<Record<string, { x: number; y: number }>>({});

  const updateCoordinates = useCallback(() => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const newNodes: Record<string, { x: number; y: number }> = {};
    
    const calc = (el: HTMLDivElement | null, id: string) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      newNodes[id] = {
        x: rect.left - containerRect.left + rect.width / 2,
        y: rect.top - containerRect.top + rect.height / 2,
      };
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    leftOptions.forEach((opt: any) => calc(leftRefs.current[opt.id], `left-${opt.id}`));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    shuffledRightOptions.forEach((opt: any) => calc(rightRefs.current[opt.id], `right-${opt.id}`));
    
    setNodes(newNodes);
  }, [leftOptions, shuffledRightOptions]);

  // Update coordinates on mount and resize
  useEffect(() => {
    updateCoordinates();
    
    // Also use ResizeObserver for more robust tracking (e.g. if fonts load, layout shifts)
    const observer = new ResizeObserver(() => updateCoordinates());
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    window.addEventListener("resize", updateCoordinates);
    
    return () => {
      window.removeEventListener("resize", updateCoordinates);
      observer.disconnect();
    };
  }, [updateCoordinates]);

  // --- Interaction State ---
  const [drawing, setDrawing] = useState<{
    fromId: string;
    fromSide: "left" | "right";
    x: number;
    y: number;
  } | null>(null);

  const [hoveredTarget, setHoveredTarget] = useState<{
    id: string;
    side: "left" | "right";
  } | null>(null);

  const handlePointerDown = (e: React.PointerEvent, id: string, side: "left" | "right") => {
    if (disabled) return;
    
    // Release capture so window can track pointer up/move natively
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch (err) {}
    
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;

    setDrawing({
      fromId: id,
      fromSide: side,
      x: e.clientX - containerRect.left,
      y: e.clientY - containerRect.top,
    });
  };

  useEffect(() => {
    if (!drawing) return;

    const handlePointerMove = (e: PointerEvent) => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      setDrawing(prev => prev ? {
        ...prev,
        x: e.clientX - containerRect.left,
        y: e.clientY - containerRect.top
      } : null);
    };

    const handlePointerUp = () => {
      if (drawing && hoveredTarget) {
        // Connect if dropped on opposite side
        if (drawing.fromSide !== hoveredTarget.side) {
          const leftId = drawing.fromSide === "left" ? drawing.fromId : hoveredTarget.id;
          const rightId = drawing.fromSide === "right" ? drawing.fromId : hoveredTarget.id;
          
          const newPairs = { ...selectedPairs };
          // Enforce 1:1 matching
          for (const key of Object.keys(newPairs)) {
            if (newPairs[key] === rightId) delete newPairs[key];
          }
          newPairs[leftId] = rightId;
          onChange(newPairs);
        }
      } else if (drawing && !hoveredTarget) {
        // Disconnect if dropped in empty space and starting from a connected node
        const newPairs = { ...selectedPairs };
        let changed = false;
        
        if (drawing.fromSide === "left" && newPairs[drawing.fromId]) {
          delete newPairs[drawing.fromId];
          changed = true;
        } else if (drawing.fromSide === "right") {
          for (const key of Object.keys(newPairs)) {
            if (newPairs[key] === drawing.fromId) {
              delete newPairs[key];
              changed = true;
            }
          }
        }
        if (changed) onChange(newPairs);
      }
      setDrawing(null);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [drawing, hoveredTarget, onChange, selectedPairs]);

  // --- SVG Rendering ---
  const renderPath = (x1: number, y1: number, x2: number, y2: number, active = false, key: string) => {
    const distance = Math.abs(x2 - x1);
    const controlPointOffset = Math.max(distance * 0.4, 40);
    const d = `M ${x1} ${y1} C ${x1 + controlPointOffset} ${y1}, ${x2 - controlPointOffset} ${y2}, ${x2} ${y2}`;
    
    return (
      <path
        key={key}
        d={d}
        fill="none"
        stroke={active ? "currentColor" : "#10b981"}
        strokeWidth={active ? "4" : "5"}
        strokeLinecap="round"
        className={active ? "text-emerald-500/60 stroke-dasharray-[8,8] animate-[dash_1s_linear_infinite]" : "drop-shadow-sm transition-all duration-300"}
      />
    );
  };

  const getTargetClasses = (side: "left" | "right", id: string) => {
    const isDrawing = drawing !== null;
    const isOpposite = drawing && drawing.fromSide !== side;
    const isHovered = hoveredTarget?.id === id && hoveredTarget?.side === side;
    
    if (!isDrawing) return "";
    if (isOpposite && isHovered) return "ring-4 ring-emerald-500/20 bg-emerald-50 scale-105 border-emerald-400";
    if (isOpposite) return "ring-2 ring-primary/10 hover:border-primary/50";
    return "opacity-50 grayscale";
  };

  return (
    <div className="flex flex-1 flex-col w-full space-y-6 select-none">
      <style>{`
        @keyframes dash {
          to { stroke-dashoffset: -16; }
        }
      `}</style>
      
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[20px] border border-border/50 bg-primary/[0.02] px-6 py-4">
        <p className="text-sm font-medium leading-relaxed text-primary/80">
          Match each term by dragging a line connecting the dots between the left and right sides.
        </p>
        <div className="flex h-8 items-center justify-center rounded-full bg-primary/10 px-4 text-xs font-bold text-primary">
          {matchedCount}/{leftOptions.length} matched
        </div>
      </div>

      <div className="relative flex gap-8 lg:gap-16 xl:gap-24 touch-none" ref={containerRef}>
        
        {/* SVG Overlay */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
          {/* Established connections */}
          {Object.entries(selectedPairs).map(([leftId, rightId]) => {
            const lNode = nodes[`left-${leftId}`];
            const rNode = nodes[`right-${rightId}`];
            
            // If drawing from one of these nodes, don't show the static line
            if (drawing && ((drawing.fromSide === "left" && drawing.fromId === leftId) || 
                            (drawing.fromSide === "right" && drawing.fromId === rightId))) {
              return null;
            }

            if (lNode && rNode) {
              return renderPath(lNode.x, lNode.y, rNode.x, rNode.y, false, `conn-${leftId}-${rightId}`);
            }
            return null;
          })}

          {/* Active drawing connection */}
          {drawing && (() => {
            let x1 = 0, y1 = 0, x2 = 0, y2 = 0;
            if (drawing.fromSide === "left") {
              const origin = nodes[`left-${drawing.fromId}`];
              if (!origin) return null;
              x1 = origin.x; y1 = origin.y;
              
              if (hoveredTarget && hoveredTarget.side === "right") {
                const target = nodes[`right-${hoveredTarget.id}`];
                if (target) { x2 = target.x; y2 = target.y; }
              }
              if (x2 === undefined) { x2 = drawing.x; y2 = drawing.y; }
            } else {
              const origin = nodes[`right-${drawing.fromId}`];
              if (!origin) return null;
              x2 = origin.x; y2 = origin.y;
              
              if (hoveredTarget && hoveredTarget.side === "left") {
                const target = nodes[`left-${hoveredTarget.id}`];
                if (target) { x1 = target.x; y1 = target.y; }
              }
              if (x1 === undefined) { x1 = drawing.x; y1 = drawing.y; }
            }
            return renderPath(x1, y1, x2, y2, true, 'active-drawing');
          })()}
        </svg>

        {/* Left Terms */}
        <div className="flex flex-col gap-4 w-1/2 z-10">
          <h3 className="text-xs font-bold uppercase tracking-wider text-primary/60 mb-2 pl-2">Terms</h3>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {leftOptions.map((opt: any, index: number) => {
            const isConnected = !!selectedPairs[opt.id];
            const isActive = drawing?.fromSide === "left" && drawing?.fromId === opt.id;
            
            return (
              <div 
                key={opt.id} 
                className={`flex items-stretch rounded-2xl border-2 transition-all duration-300 bg-white/95 backdrop-blur-sm shadow-sm
                  ${getTargetClasses("left", opt.id)}
                  ${isConnected && !drawing ? "border-emerald-200" : "border-border/60"}
                `}
              >
                <div className="flex flex-1 items-center gap-3 p-4">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-primary/70">
                    {index + 1}
                  </span>
                  <p className="text-sm font-semibold text-primary">{opt.text}</p>
                </div>
                
                {/* Connection Handle (Right side of left card) */}
                <div 
                  className="flex items-center justify-center border-l-2 border-border/30 px-3 cursor-pointer touch-none"
                  onPointerDown={(e) => handlePointerDown(e, opt.id, "left")}
                  onPointerEnter={() => setHoveredTarget({ id: opt.id, side: "left" })}
                  onPointerLeave={() => setHoveredTarget(prev => prev?.id === opt.id ? null : prev)}
                >
                  <div 
                    ref={el => { leftRefs.current[opt.id] = el; }}
                    className={`h-5 w-5 rounded-full border-4 transition-all duration-300 flex items-center justify-center
                      ${isActive ? "bg-emerald-500 border-emerald-300 scale-125 shadow-md" : 
                        isConnected ? "bg-emerald-500 border-emerald-200" : 
                        "bg-white border-primary/30 hover:border-emerald-400 hover:bg-emerald-50 hover:scale-110"
                      }
                    `}
                  >
                    {isConnected && !isActive && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Answers */}
        <div className="flex flex-col gap-4 w-1/2 z-10">
          <h3 className="text-xs font-bold uppercase tracking-wider text-primary/60 mb-2 pl-2">Answers</h3>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {shuffledRightOptions.map((opt: any) => {
            const isConnected = Object.values(selectedPairs).includes(opt.id);
            const isActive = drawing?.fromSide === "right" && drawing?.fromId === opt.id;
            
            return (
              <div 
                key={opt.id} 
                className={`flex items-stretch rounded-2xl border-2 transition-all duration-300 bg-white/95 backdrop-blur-sm shadow-sm
                  ${getTargetClasses("right", opt.id)}
                  ${isConnected && !drawing ? "border-emerald-200" : "border-border/60"}
                `}
              >
                {/* Connection Handle (Left side of right card) */}
                <div 
                  className="flex items-center justify-center border-r-2 border-border/30 px-3 cursor-pointer touch-none"
                  onPointerDown={(e) => handlePointerDown(e, opt.id, "right")}
                  onPointerEnter={() => setHoveredTarget({ id: opt.id, side: "right" })}
                  onPointerLeave={() => setHoveredTarget(prev => prev?.id === opt.id ? null : prev)}
                >
                  <div 
                    ref={el => { rightRefs.current[opt.id] = el; }}
                    className={`h-5 w-5 rounded-full border-4 transition-all duration-300 flex items-center justify-center
                      ${isActive ? "bg-emerald-500 border-emerald-300 scale-125 shadow-md" : 
                        isConnected ? "bg-emerald-500 border-emerald-200" : 
                        "bg-white border-primary/30 hover:border-emerald-400 hover:bg-emerald-50 hover:scale-110"
                      }
                    `}
                  >
                    {isConnected && !isActive && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </div>
                </div>

                <div className="flex flex-1 items-center gap-3 p-4">
                  <p className="text-sm font-semibold text-primary">{opt.text}</p>
                </div>
              </div>
            );
          })}
        </div>
        
      </div>
    </div>
  );
}
