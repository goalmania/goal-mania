import { NextResponse } from "next/server";

export async function GET() {
  const API_KEY = process.env.FOOTBALL_API;

  try {
    const res = await fetch("https://api.football-data.org/v4/competitions/WC/teams", {
      headers: {
        "X-Auth-Token": API_KEY || "",
      },
      next: { revalidate: 3600 }, 
    });

    if (!res.ok) {
      return NextResponse.json({ error: "External API failed" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Connection failed" }, { status: 500 });
  }
}