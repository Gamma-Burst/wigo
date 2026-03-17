import { NextResponse } from "next/server";
import { bookHotel } from "@/services/hotel-provider";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { offerId, guests, payment } = body;

    if (!offerId || !guests?.length) {
      return NextResponse.json(
        { error: "offerId et guests sont requis." },
        { status: 400 }
      );
    }

    const result = await bookHotel({ offerId, guests, payment });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Hotel booking error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la réservation." },
      { status: 500 }
    );
  }
}
