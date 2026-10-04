import { NextResponse } from "next/server";
import { INITIAL_VISITS } from "@/lib/mock-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get("patientId");

  let list = INITIAL_VISITS;
  if (patientId) {
    list = list.filter((v) => v.patientId === patientId);
  }

  return NextResponse.json({
    success: true,
    data: list,
    meta: {
      total: list.length,
    },
    errors: [],
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.patientId || !body.doctorId) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          errors: ["شناسه بیمار و پزشک الزامی است."],
        },
        { status: 400 }
      );
    }

    const newVisit = {
      ...body,
      id: `vis_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      finalizedAt: body.status === "finalized" ? new Date().toISOString() : null,
    };

    return NextResponse.json(
      {
        success: true,
        data: newVisit,
        errors: [],
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        data: null,
        errors: ["داده ورودی ویزیت نامعتبر است."],
      },
      { status: 400 }
    );
  }
}
