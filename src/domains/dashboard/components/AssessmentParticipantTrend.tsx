"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SessionActivityPoint } from "@/src/domains/dashboard/types/dashboard.types";
import DashboardSectionCard from "./DashboardSectionCard";

export default function AssessmentParticipantTrend({
  data,
}: {
  data: SessionActivityPoint[];
}) {
  return (
    <DashboardSectionCard
      title="Session and participation trend"
      description="A quick pulse on session volume and participant reach over the last reporting windows."
      className="xl:col-span-2"
    >
      <div className="h-72 min-h-72 w-full min-w-0 sm:h-80 sm:min-h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              tickLine={false}
              axisLine={{ stroke: "#e5e7eb" }}
              style={{ fontSize: "12px" }}
            />
            <YAxis
              stroke="#6b7280"
              tickLine={false}
              axisLine={{ stroke: "#e5e7eb" }}
              style={{ fontSize: "12px" }}
            />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="sessions"
              stroke="#1B4332"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 5 }}
              name="Sessions"
            />
            <Line
              type="monotone"
              dataKey="participants"
              stroke="#74C69D"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 5 }}
              name="Participants"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </DashboardSectionCard>
  );
}
