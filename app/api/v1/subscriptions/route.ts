import { NextResponse } from "next/server";
import {
  INITIAL_DOCTOR_SUBSCRIPTION,
  INITIAL_PAYMENT_TRANSACTIONS,
  MOCK_SUBSCRIPTION_PLANS,
} from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      plans: MOCK_SUBSCRIPTION_PLANS,
      currentSubscription: INITIAL_DOCTOR_SUBSCRIPTION,
      transactions: INITIAL_PAYMENT_TRANSACTIONS,
    },
    errors: [],
  });
}
