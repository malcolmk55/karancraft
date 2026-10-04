import { NextResponse } from "next/server";
import { INITIAL_PATIENTS } from "@/lib/mock-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.toLowerCase().trim();
  const officeId = searchParams.get("officeId");

  let results = INITIAL_PATIENTS;
  if (officeId) {
    results = results.filter((p) => p.createdByOfficeId === officeId);
  }

  if (q) {
    results = results.filter(
      (p) =>
        p.fullName.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        p.nationalId?.includes(q)
    );
  }

  return NextResponse.json({
    success: true,
    data: results,
    meta: {
      total: results.length,
      page: 1,
    },
    errors: [],
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.fullName || !body.phone) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          errors: ["نام و شماره تماس بیمار الزامی است."],
        },
        { status: 400 }
      );
    }

    const newPatient = {
      ...body,
      id: `pat_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        data: newPatient,
        errors: [],
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        data: null,
        errors: ["داده‌های ارسالی نامعتبر است."],
      },
      { status: 400 }
    );
  }
}
