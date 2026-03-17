import { NextResponse } from "next/server";
import { confirmFlightPrice } from "@/services/flight-provider";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { offer } = body;

    if (!offer) {
      return NextResponse.json({ error: "L'offre de vol est requise." }, { status: 400 });
    }

    const result = await confirmFlightPrice(offer);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Flight price confirmation error:", error);
    return NextResponse.json({ error: "Erreur lors de la confirmation du prix." }, { status: 500 });
  }
}
