import { NextResponse } from "next/server";
import { searchFlights } from "@/services/flight-provider";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { origin, destination, departDate, returnDate, adults, cabin, maxPrice, nonStop } = body;

    if (!origin || !destination || !departDate) {
      return NextResponse.json(
        { error: "origin, destination et departDate sont requis." },
        { status: 400 }
      );
    }

    const results = await searchFlights({
      origin,
      destination,
      departDate,
      returnDate: returnDate || undefined,
      adults: adults || 1,
      cabin: cabin || undefined,
      maxPrice: maxPrice || undefined,
      nonStop: nonStop || false,
      max: 15,
    });

    return NextResponse.json({
      results,
      meta: {
        origin,
        destination,
        departDate,
        returnDate,
        count: results.length,
      },
    });
  } catch (error) {
    console.error("Flight search error:", error);
    return NextResponse.json({ error: "Erreur lors de la recherche de vols." }, { status: 500 });
  }
}
