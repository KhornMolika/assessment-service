import { ImageResponse } from "next/og";
import { getAssessmentCatalogItemById } from "@/src/api/assessment.api";

export const alt = "Join Assessment Preview";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const assessment = await getAssessmentCatalogItemById(id);

  const title = assessment?.name ?? "Assessment Service";
  const mode = assessment?.settings?.mode === "REAL_TIME" ? "Real-time" : "Self-paced";
  const questionCount = assessment?.questionCount ?? 0;

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
          {/* Decorative floating shapes */}
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
              You&apos;re Invited!
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
                  fontSize: 64,
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
                  fontSize: 32,
                  lineHeight: 1.4,
                  color: "#446257",
                  fontWeight: 600,
                }}
              >
                Join this assessment to test your knowledge!
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
              {/* Stat Metric 1 */}
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
                  Type
                </div>
                <div
                  style={{
                    display: "flex",
                    fontSize: 34,
                    fontWeight: 700,
                    color: "#0f583e",
                  }}
                >
                  {mode}
                </div>
              </div>

              {/* Stat Metric 2 */}
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
                  Questions
                </div>
                <div
                  style={{
                    display: "flex",
                    fontSize: 34,
                    fontWeight: 700,
                    color: "#0f583e",
                  }}
                >
                  {questionCount}
                </div>
              </div>
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
              <div style={{ display: "flex" }}>Click to join now</div>
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
