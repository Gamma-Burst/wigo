import { NextResponse } from "next/server";
import { searchActivities, getPointsOfInterest } from "@/services/activity-provider";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { lat, lng, radius, type } = body;

    if (!lat || !lng) {
      return NextResponse.json({ error: "lat et lng sont requis." }, { status: 400 });
    }

    if (type === "poi") {
      const results = await getPointsOfInterest(lat, lng, radius);
      return NextResponse.json({ results, type: "poi" });
    }

    const results = await searchActivities(lat, lng, radius);
    return NextResponse.json({ results, type: "activities" });
  } catch (error) {
    console.error("Activities search error:", error);
    return NextResponse.json({ error: "Erreur lors de la recherche d'activités." }, { status: 500 });
  }
}
