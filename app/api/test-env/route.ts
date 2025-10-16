import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME ? "✅ SET" : "❌ MISSING",
      apiKey: process.env.CLOUDINARY_API_KEY ? "✅ SET" : "❌ MISSING",
      apiSecret: process.env.CLOUDINARY_API_SECRET ? "✅ SET" : "❌ MISSING",
    },
    environment: process.env.VERCEL_ENV || "local",
  });
}
