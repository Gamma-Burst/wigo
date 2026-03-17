import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2026-01-28.clover',
});

export async function POST(req: Request) {
    try {
        const { hotelName, price, hotelId, imageUrl } = await req.json();

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: `WIGO : ${hotelName}`,
                        images: [imageUrl],
                    },
                    unit_amount: Math.round(price * 100), // En centimes pour Stripe
                },
                quantity: 1,
            }],
            mode: 'payment',
            metadata: { hotelId },
            success_url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/historique?success=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/`,
        });

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error("Stripe Error:", error);
        return NextResponse.json({ error: "Erreur Stripe" }, { status: 500 });
    }
}