import { NextResponse } from "next/server";
import { INITIAL_VISITS } from "@/lib/mock-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get("patientId");

  let results = INITIAL_VISITS;
  if (patientId) {
    results = results.filter((v) => v.patientId === patientId);
  }

  return NextResponse.json({
    success: true,
    data: results,
    count: results.length,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.patientId || !body.doctorId) {
      return NextResponse.json(
        { success: false, error: "شناسه بیمار و پزشک الزامی است." },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const newVisit = {
      ...body,
      id: `vis_${Date.now()}`,
      createdAt: now,
      updatedAt: now,
      finalizedAt: body.status === "finalized" ? now : null,
    };

    return NextResponse.json({ success: true, data: newVisit }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, error: "خطا در پردازش اطلاعات ویزیت." },
      { status: 400 }
    );
  }
}
