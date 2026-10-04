import { NextResponse } from "next/server";
import { INITIAL_DOCTOR_CONNECTIONS, MOCK_DOCTORS } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json({
    success: true,
    data: INITIAL_DOCTOR_CONNECTIONS,
    meta: {
      total: INITIAL_DOCTOR_CONNECTIONS.length,
    },
    errors: [],
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newConnection = {
      id: `conn_${Date.now()}`,
      requesterId: body.requesterId || "doc_1",
      receiverId: body.receiverId,
      status: "pending",
      requestedAt: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        data: newConnection,
        errors: [],
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { success: false, data: null, errors: ["درخواست ارتباط نامعتبر است."] },
      { status: 400 }
    );
  }
}
