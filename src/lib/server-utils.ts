"use server";

import { cookies } from "next/headers";

export async function getEmbedTokenCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get("assessment_embed_token")?.value;
}
