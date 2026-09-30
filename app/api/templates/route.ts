import { NextResponse } from "next/server";
import { INITIAL_TEMPLATES } from "@/lib/templates-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const specialty = searchParams.get("specialty");

  let results = INITIAL_TEMPLATES;
  if (specialty) {
    results = results.filter(
      (t) => t.specialty === specialty || t.specialty === "general"
    );
  }

  return NextResponse.json({
    success: true,
    data: results,
    count: results.length,
  });
}
