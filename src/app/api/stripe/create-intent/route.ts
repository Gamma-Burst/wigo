import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from '@/utils/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16' as Stripe.StripeConfig['apiVersion'], 
});

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Note: In some dev environments, user might be null if not logged in.
    // For this prototype, if no user, we'll try to find or create a default 'guest' user 
    // or just return 401 if we want to enforce login.
    if (!user) {
      return NextResponse.json({ error: "Authentification requise pour réserver." }, { status: 401 });
    }

    const { amount, title, type, itemId, customerInfo } = await req.json();

    if (!amount || !title || !type || !itemId) {
      return NextResponse.json({ error: "Données de réservation incomplètes." }, { status: 400 });
    }

    // 1. Create Stripe Payment Intent
    // amount is expected in cents
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'eur',
      metadata: {
        userId: user.id,
        itemId,
        type,
        title
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // 2. Create PENDING booking in database
    // Ensure we have a DB user that matches the Supabase ID
    let dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser && user.email) {
        dbUser = await prisma.user.create({
            data: {
                id: user.id,
                email: user.email,
                clerkUserId: user.id, // Using Supabase ID as clerkUserId for compatibility
                name: user.user_metadata?.full_name || 'Voyageur WIGO'
            }
        });
    }

    if (!dbUser) {
        return NextResponse.json({ error: "Utilisateur non trouvé en base." }, { status: 404 });
    }

    const booking = await prisma.booking.create({
      data: {
        userId: dbUser.id,
        type,
        itemId,
        title,
        amount,
        status: 'PENDING',
        paymentIntentId: paymentIntent.id,
        customerName: customerInfo?.name,
        customerEmail: customerInfo?.email || user.email,
        customerPhone: customerInfo?.phone
      }
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      bookingId: booking.id
    });

  } catch (error) {
    console.error("[STRIPE_INTENT_ERROR]", error);
    return NextResponse.json({ error: "Erreur lors de la création de la session de paiement." }, { status: 500 });
  }
}
