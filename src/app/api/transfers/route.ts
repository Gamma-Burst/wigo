import { NextResponse } from "next/server";
import { searchTransfers } from "@/services/transfer-provider";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { startLocationCode, endGeoCode, endAddressLine, transferDate, passengers } = body;

    if (!startLocationCode || !transferDate) {
      return NextResponse.json(
        { error: "startLocationCode et transferDate sont requis." },
        { status: 400 }
      );
    }

    const results = await searchTransfers({
      startLocationCode,
      endGeoCode: endGeoCode || undefined,
      endAddressLine: endAddressLine || undefined,
      transferDate,
      passengers: passengers || 1,
    });

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Transfer search error:", error);
    return NextResponse.json({ error: "Erreur lors de la recherche de transferts." }, { status: 500 });
  }
}
