"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiClient } from "@/src/lib/api-client";
import { Button } from "@/src/components/ui/ui/button";
import { Input } from "@/src/components/ui/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/ui/card";
import { Gamepad2 } from "lucide-react";

export default function GlobalJoinPage() {
  const [pinCode, setPinCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = pinCode.trim().toUpperCase();
    
    if (!code || code.length !== 6) {
      toast.error("Please enter a valid 6-digit PIN.");
      return;
    }

    setIsLoading(true);
    try {
      // Lookup the session
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await apiClient.get<any>(`/runtime/real-time/sessions/${code}`);
      
      const sessionData = res.data || res;
      if (sessionData && sessionData.assessmentId) {
        toast.success(`Joining ${sessionData.title || 'Assessment'}...`);
        // Redirect to the assessment's real-time entry page with the sessionCode
        router.push(`/assessments/${sessionData.assessmentId}/enter-real-time-assessment?sessionCode=${code}`);
      } else {
        toast.error("Invalid session code or session has ended.");
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to find session. Please check the PIN.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-zinc-50 p-4 dark:bg-zinc-950">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Gamepad2 className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">Join Live Assessment</CardTitle>
          <CardDescription className="text-base">
            Enter the 6-digit PIN provided by your host
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleJoin} className="space-y-6">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="123456"
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
                maxLength={6}
                className="h-16 text-center text-4xl font-bold tracking-widest uppercase"
                disabled={isLoading}
                autoComplete="off"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-14 text-lg font-semibold"
              disabled={isLoading || pinCode.length !== 6}
            >
              {isLoading ? "Connecting..." : "Join Now"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
