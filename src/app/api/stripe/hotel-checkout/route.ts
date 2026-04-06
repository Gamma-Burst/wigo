import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2026-01-28.clover',
});

export async function POST(req: Request) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { hotelName, price, hotelId, imageUrl } = await req.json();

        // Detect correct base URL for Stripe success/cancel redirects
        const baseUrl = process.env.NEXT_PUBLIC_URL
            ? process.env.NEXT_PUBLIC_URL
            : process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}`
            : 'http://localhost:3000';

        if (!process.env.STRIPE_SECRET_KEY) {
            console.error("Missing STRIPE_SECRET_KEY environment variable");
            return NextResponse.json({ error: "Configuration Stripe manquante" }, { status: 500 });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: `WIGO : ${hotelName}`,
                        images: imageUrl ? [imageUrl] : [],
                    },
                    unit_amount: Math.round(price * 100), // En centimes pour Stripe
                },
                quantity: 1,
            }],
            mode: 'payment',
            metadata: { hotelId: hotelId || 'unknown' },
            success_url: `${baseUrl}/historique?success=true`,
            cancel_url: `${baseUrl}/`,
        });

        return NextResponse.json({ url: session.url });
    } catch (error: unknown) {
        const err = error as Error;
        console.error("Stripe Error Details:", err.message || err);
        return NextResponse.json({ error: "Erreur Stripe: " + (err.message || "Unknown error") }, { status: 500 });
    }
}