import { NextResponse } from "next/server";
import { getFlightInspiration } from "@/services/flight-provider";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const origin = searchParams.get("origin");

    if (!origin) {
      return NextResponse.json({ error: "Le paramètre origin est requis." }, { status: 400 });
    }

    const maxPrice = searchParams.get("maxPrice");
    const results = await getFlightInspiration(origin, maxPrice ? parseInt(maxPrice) : undefined);

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Flight inspiration error:", error);
    return NextResponse.json({ error: "Erreur lors de la recherche d'inspiration." }, { status: 500 });
  }
}
