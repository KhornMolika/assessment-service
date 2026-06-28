"use client";

import { useEffect, useRef, useState } from "react";
import { MonitorPlay, Smartphone } from "lucide-react";
import { AssessmentCatalogItem, AssessmentDetailQuestionItem } from "@/src/types";
import { PresentRealTimeScreen } from "./PresentRealTimeScreen";
import { EnterRealTimeScreen } from "./EnterRealTimeScreen";
import { cn } from "@/src/lib/utils";
import { useRealtimeSession } from "@/src/hooks/use-realtime-session";
import { RoomRole } from "@/src/types/runtime.types";
import { startRealtimeSessionHost } from "@/src/lib/actions/runtime.actions";
import { toast } from "sonner";

export function RealTimeSimulator({
  assessment,
  questions,
}: {
  assessment: AssessmentCatalogItem;
  questions: AssessmentDetailQuestionItem[];
}) {
  const [viewMode, setViewMode] = useState<"host" | "participant">("host");
  const [previewParticipants, setPreviewParticipants] = useState<
    Array<{ id: string; name: string }>
  >([]);

  const hostSession = useRealtimeSession();
  const participantSession = useRealtimeSession();
  const { isConnected, joinRoom, resetRoomState } = hostSession;
  const { resetRoomState: resetParticipantRoomState } = participantSession;

  // Auto-join as HOST once connected. Preview always resets the room so it
  // starts from the lobby instead of resuming old Redis state.
  const hostJoinedRef = useRef(false);
  useEffect(() => {
    if (!isConnected || hostJoinedRef.current) return;
    async function initHost() {
      resetRoomState();
      resetParticipantRoomState();
      setPreviewParticipants([]);
      const res = await startRealtimeSessionHost(assessment.id, { reset: true });
      if (res.success) {
        joinRoom(assessment.id, RoomRole.HOST);
        hostJoinedRef.current = true;
      } else {
        toast.error("Failed to initialize host session on backend");
      }
    }
    initHost();
  }, [assessment.id, joinRoom, isConnected, resetParticipantRoomState, resetRoomState]);

  useEffect(() => {
    if (viewMode !== "host" || !hostJoinedRef.current || hostSession.roomState.phase !== "lobby") {
      return;
    }

    joinRoom(assessment.id, RoomRole.HOST);
  }, [assessment.id, hostSession.roomState.phase, joinRoom, viewMode]);

  return (
    <div className="flex h-[calc(100vh-64px)] w-full flex-col overflow-hidden relative bg-transparent">
      
      {/* Segmented Control Header */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 rounded-full bg-white/90 p-1.5 shadow-lg shadow-black/5 backdrop-blur-xl border border-slate-200">
        <button
          type="button"
          onClick={() => setViewMode("host")}
          className={cn(
            "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all",
            viewMode === "host"
              ? "bg-[#113023] text-white shadow-md"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
          )}
        >
          <MonitorPlay className="h-4 w-4" />
          Host View
        </button>
        <button
          type="button"
          onClick={() => setViewMode("participant")}
          className={cn(
            "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all",
            viewMode === "participant"
              ? "bg-primary text-primary-foreground shadow-md"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
          )}
        >
          <Smartphone className="h-4 w-4" />
          Participant View
        </button>
      </div>

      {/* Simulator Content */}
      <div className="flex-1 min-h-0 w-full grid grid-cols-1 transition-all duration-300 ease-in-out">
        
        {/* Host View Pane */}
        <div className={cn("flex h-full min-h-0 flex-col bg-transparent relative", viewMode !== "host" && "hidden")}>
          <div className="flex-1 overflow-auto">
            <PresentRealTimeScreen 
              assessment={assessment} 
              questions={questions} 
              embedded={false}
              session={hostSession}
              previewParticipants={previewParticipants}
            />
          </div>
        </div>

        {/* Participant View Pane */}
        <div className={cn("flex h-full min-h-0 flex-col bg-transparent relative", viewMode !== "participant" && "hidden")}>
          <div className="flex-1 overflow-auto">
             <EnterRealTimeScreen 
               assessment={assessment}
               embedded={false}
               session={participantSession}
               onPreviewParticipantJoined={(participant) => {
                 setPreviewParticipants((current) => {
                   if (current.some((item) => item.id === participant.id)) {
                     return current;
                   }
                   return [...current, participant];
                 });
               }}
             />
          </div>
        </div>
      </div>
    </div>
  );
}
