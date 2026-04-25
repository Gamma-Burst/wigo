import { NextResponse } from "next/server";
import { searchLocations } from "@/services/location-provider";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const keyword = searchParams.get("keyword");
    const subType = searchParams.get("subType");

    if (!keyword || keyword.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const results = await searchLocations(keyword, subType || undefined);
    return NextResponse.json({ results });
  } catch (error) {
    console.error("Location search error:", error);
    return NextResponse.json({ error: "Erreur autocomplete." }, { status: 500 });
  }
}
