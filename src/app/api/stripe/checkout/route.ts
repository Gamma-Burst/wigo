import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2026-01-28.clover',
});

export async function POST() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Usually you would query Prisma here to see if the user already has a Stripe Customer ID:
        // const dbUser = await prisma.user.findUnique({ where: { clerkUserId: userId } });

        // We are creating a simple Checkout Session directly 
        const stripeSession = await stripe.checkout.sessions.create({
            success_url: `${process.env.NODE_SERVER_URL || 'http://localhost:3001'}/historique?success=true`,
            cancel_url: `${process.env.NODE_SERVER_URL || 'http://localhost:3001'}/pricing?canceled=true`,
            payment_method_types: ['card'],
            mode: 'subscription',
            billing_address_collection: 'auto',
            customer_email: undefined, // Let Stripe ask for it or pass it if you have the user's email
            line_items: [
                {
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: 'WIGO Pro',
                            description: 'Accédez à toutes les recherches IA et lieux secrets en illimité.',
                        },
                        unit_amount: 499, // 4.99€ en centimes
                        recurring: {
                            interval: 'month'
                        }
                    },
                    quantity: 1,
                }
            ],
            metadata: {
                clerkUserId: userId,
            },
        });

        return new NextResponse(JSON.stringify({ url: stripeSession.url }), { status: 200 });

    } catch (error: Error | unknown) {
        console.error("[STRIPE_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
