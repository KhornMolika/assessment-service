import { NextResponse } from "next/server";
import { apiClient } from "@/src/lib/api-client";

export async function GET() {
  try {
    const res = await apiClient.get<any>("/banks/66a82a13-5dde-4a07-a2c6-bc548082176a/questions");
    return NextResponse.json(res);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
