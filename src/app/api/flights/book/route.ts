import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2026-01-28.clover",
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { flightNumber, airline, origin, destination, departureTime, returnTime, price, currency, cabin, passengers } = body;

    if (!price || !origin || !destination) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const departDate = new Date(departureTime).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
    const description = returnTime
      ? `Vol aller-retour ${origin} → ${destination} · ${departDate} · ${cabin} · ${passengers || 1} passager(s)`
      : `Vol ${origin} → ${destination} · ${departDate} · ${cabin} · ${passengers || 1} passager(s)`;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3099";

    const session = await stripe.checkout.sessions.create({
      success_url: `${baseUrl}/vols?booking=success&flight=${encodeURIComponent(flightNumber)}`,
      cancel_url: `${baseUrl}/vols?booking=canceled`,
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: (currency || "EUR").toLowerCase(),
            product_data: {
              name: `Vol ${airline} ${flightNumber}`,
              description,
              images: [],
            },
            unit_amount: Math.round(price * 100), // Convert to cents
          },
          quantity: passengers || 1,
        },
      ],
      metadata: {
        type: "flight_booking",
        flightNumber,
        airline,
        origin,
        destination,
        departureTime,
        cabin,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[FLIGHT_BOOKING_ERROR]", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la session de paiement" },
      { status: 500 }
    );
  }
}
