"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ScoreDistributionPoint } from "@/src/domains/dashboard/types/dashboard.types";
import DashboardSectionCard from "./DashboardSectionCard";

export default function ScoreDistribution({
  data,
}: {
  data: ScoreDistributionPoint[];
}) {
  return (
    <DashboardSectionCard
      title="Score distribution"
      description="Latest score spread from completed assessments."
    >
      <div className="h-72 min-h-72 w-full min-w-0 sm:h-80 sm:min-h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: -20, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="range"
              stroke="#6b7280"
              tickLine={false}
              axisLine={{ stroke: "#e5e7eb" }}
              style={{ fontSize: "11px" }}
            />
            <YAxis
              stroke="#6b7280"
              tickLine={false}
              axisLine={{ stroke: "#e5e7eb" }}
              style={{ fontSize: "11px" }}
            />
            <Tooltip />
            <Bar dataKey="count" fill="#1B4332" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </DashboardSectionCard>
  );
}
