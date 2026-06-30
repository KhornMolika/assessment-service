import { ImageResponse } from "next/og";
import { getAssessmentResultSheetPageData } from "@/src/api/assessment.api";

export const alt = "Assessment result preview";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

function formatMetricValue(value: number | string) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value.toString();
  }
  return value;
}

function buildMetric(label: string, value: number | string) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        padding: "22px 24px",
        borderRadius: 24,
        background: "rgba(255, 255, 255, 0.88)",
        border: "1px solid rgba(15, 88, 62, 0.12)",
        minWidth: 0,
        flex: 1,
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 18,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "#4d6d61",
        }}
      >
        {label}
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 34,
          fontWeight: 700,
          color: "#0f583e",
        }}
      >
        {formatMetricValue(value)}
      </div>
    </div>
  );
}

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const detail = await getAssessmentResultSheetPageData(sessionId);

  const title = detail?.assessment.name ?? "Assessment Service";
  const participantName = detail?.participant.display_name ?? "Participant";
  
  const totalScore = detail?.answerSheet.totalScore ?? 0;
  const maxScore = detail?.answerSheet.maxScore ?? 0;
  const grade = detail?.answerSheet.grade ?? "N/A";
  const isPassed = detail?.answerSheet.isPassed ?? false;
  
  const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          padding: 40,
          background:
            "linear-gradient(135deg, #fdfdfd 0%, #f4f9f7 50%, #ebf5f2 100%)",
          color: "#113126",
        }}
      >
        <div
          style={{
            display: "flex",
            position: "relative",
            overflow: "hidden",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            padding: 48,
            borderRadius: 36,
            border: "2px solid rgba(15, 88, 62, 0.14)",
            background:
              "radial-gradient(circle at top left, rgba(255, 255, 255, 0.96) 0%, rgba(255, 255, 255, 0.88) 46%, rgba(234, 244, 238, 0.96) 100%)",
            boxShadow: "0 20px 80px rgba(17, 49, 38, 0.12)",
          }}
        >
          <div
            style={{
              display: "flex",
              position: "absolute",
              top: -120,
              right: -110,
              width: 320,
              height: 320,
              borderRadius: 999,
              background: "rgba(15, 88, 62, 0.08)",
            }}
          />
          <div
            style={{
              display: "flex",
              position: "absolute",
              bottom: -110,
              left: -60,
              width: 260,
              height: 260,
              borderRadius: 999,
              background: "rgba(16, 163, 127, 0.14)",
            }}
          />

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 20,
              zIndex: 1,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                alignSelf: "flex-start",
                padding: "10px 18px",
                borderRadius: 999,
                background: "#0f583e",
                color: "#fdfdfd",
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Assessment Result
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 14,
                maxWidth: 900,
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: 58,
                  lineHeight: 1.08,
                  fontWeight: 800,
                  color: "#123126",
                }}
              >
                {title}
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: 28,
                  lineHeight: 1.4,
                  color: "#446257",
                  fontWeight: 600,
                }}
              >
                Completed by {participantName}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 22,
              zIndex: 1,
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 18,
                width: "100%",
              }}
            >
              {buildMetric("Score", `${totalScore} / ${maxScore} pts`)}
              {buildMetric("Grade", grade)}
              {buildMetric("Outcome", isPassed ? "Passed" : "Failed")}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingTop: 8,
                borderTop: "1px solid rgba(15, 88, 62, 0.12)",
                fontSize: 24,
                color: "#305347",
              }}
            >
              <div style={{ display: "flex", fontWeight: 700 }}>
                Assessment Service
              </div>
              <div style={{ display: "flex" }}>Result Score: {percentage}%</div>
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
