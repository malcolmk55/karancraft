import { NextResponse } from "next/server";
import { MOCK_USERS } from "@/lib/mock-data";

export async function GET() {
  // Returns currently authenticated user (default Dr. Sara Alavi in test mode)
  return NextResponse.json({
    success: true,
    data: MOCK_USERS[0],
  });
}
