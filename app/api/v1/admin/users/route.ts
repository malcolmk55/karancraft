import { NextResponse } from "next/server";
import { MOCK_USERS } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json({
    success: true,
    data: MOCK_USERS,
    meta: {
      total: MOCK_USERS.length,
    },
    errors: [],
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newUser = {
      ...body,
      id: `user_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return NextResponse.json({ success: true, data: newUser }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, data: null, errors: ["خطا در ثبت کاربر"] },
      { status: 400 }
    );
  }
}
