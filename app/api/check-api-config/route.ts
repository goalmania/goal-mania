import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.FOOTBALL_API;

  // Check if API key exists
  const hasApiKey = !!apiKey;

  // Make a simple test call to verify API key works
  let isApiKeyValid = false;
  let apiResponse = null;

  if (hasApiKey) {
    try {
      const headers = {
        "x-apisports-key": apiKey,
        "Content-Type": "application/json",
      };

      const response = await fetch("https://v3.football.api-sports.io/status", {
        method: "GET",
        headers,
      });

      apiResponse = await response.json();
      isApiKeyValid =
        response.ok && apiResponse?.response?.subscription?.active;
    } catch (error) {
      console.error("Error checking API status:", error);
    }
  }

  return NextResponse.json({
    environmentStatus: {
      hasApiKey,
      isApiKeyValid,
      apiResponse,
    },
  });
}
