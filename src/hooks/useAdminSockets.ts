"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { getRealtimeUrl } from "@/src/lib/actions/runtime.actions";
import { getAdminClientId } from "@/src/lib/actions/assessment.actions";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { toast } from "sonner";

export function useAdminSockets() {
  const [updateTick, setUpdateTick] = useState(0);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let activeSocket: any;

    async function initSocket() {
      try {
        const clientId = await getAdminClientId();
        if (!clientId) return;

        const baseUrl = await getRealtimeUrl();
        const url = baseUrl || "http://localhost:3001";
        
        activeSocket = io(`${url}/realtime`, {
          transports: ["websocket"],
        });

        activeSocket.on("connect", () => {
          activeSocket.emit("JOIN_ADMIN_ROOM", { clientId });
        });

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        activeSocket.on("ASSESSMENT_UPDATED", (payload: { assessmentId: string; status: string }) => {
          // Trigger a re-fetch tick to silently update the UI
          setUpdateTick((t) => t + 1);
        });
      } catch (err) {
        console.error("Failed to init admin sockets", err);
      }
    }

    initSocket();

    return () => {
      if (activeSocket) {
        activeSocket.disconnect();
      }
    };
  }, []);

  return updateTick;
}
