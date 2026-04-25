import { NextResponse } from "next/server";
import { getPointsOfInterest } from "@/services/activity-provider";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const radius = searchParams.get("radius");
    const categories = searchParams.get("categories");

    if (!lat || !lng) {
      return NextResponse.json({ error: "lat et lng sont requis." }, { status: 400 });
    }

    const results = await getPointsOfInterest(
      parseFloat(lat),
      parseFloat(lng),
      radius ? parseInt(radius) : undefined,
      categories ? categories.split(",") : undefined
    );

    return NextResponse.json({ results });
  } catch (error) {
    console.error("POI search error:", error);
    return NextResponse.json({ error: "Erreur lors de la recherche de points d'intérêt." }, { status: 500 });
  }
}
