import { NextResponse } from "next/server";
import { INITIAL_AUDIT_LOGS } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json({
    success: true,
    data: INITIAL_AUDIT_LOGS,
    meta: {
      total: INITIAL_AUDIT_LOGS.length,
    },
    errors: [],
  });
}
