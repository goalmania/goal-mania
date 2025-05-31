import { NextResponse } from "next/server";

export async function GET() {
  // Check if each environment variable is set (without exposing the actual values)
  const status = {
    NEXT_PUBLIC_FOOTBALL_API_KEY: !!process.env.NEXT_PUBLIC_FOOTBALL_API_KEY,
    FOOTBALL_API: !!process.env.FOOTBALL_API,
    NEXT_FOOTBALL_API: !!process.env.NEXT_FOOTBALL_API,
  };

  return NextResponse.json(status);
}
