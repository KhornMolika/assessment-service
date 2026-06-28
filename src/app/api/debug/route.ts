import { NextResponse } from "next/server";
import { apiClient } from "@/src/lib/api-client";

export async function GET() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await apiClient.get<any>("/banks/66a82a13-5dde-4a07-a2c6-bc548082176a/questions");
    return NextResponse.json(res);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
