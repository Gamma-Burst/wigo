import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client'

// Prevent Prisma instantiation during Next.js static build phase if URL is missing
// Note: In Prisma v7, `datasourceUrl` is no longer passed to the constructor.
// It uses `prisma.config.ts` to source the URL.
const globalForPrisma = global as unknown as { prisma: PrismaClient }
const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: "2026-01-28.clover",
});

export async function POST(req: Request) {
    const body = await req.text();
    const signature = headers().get("Stripe-Signature") as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (error: Error | unknown) {
        const err = error as Error;
        return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    if (event.type === "checkout.session.completed") {

        // We get the supabaseUserId from the metadata we passed in the checkout
        const supabaseUserId = session.metadata?.supabaseUserId;

        if (supabaseUserId) {
            // Find or create user, update PRO status
            await prisma.user.upsert({
                where: {
                    clerkUserId: supabaseUserId,
                },
                update: {
                    isPro: true,
                    tier: "pro",
                    stripeCustomerId: session.customer as string,
                },
                create: {
                    clerkUserId: supabaseUserId,
                    email: session.customer_details?.email || "unknown@stripe.com",
                    name: session.customer_details?.name || "WIGO Pro User",
                    isPro: true,
                    tier: "pro",
                    stripeCustomerId: session.customer as string,
                }
            });
        }

    }

    return new NextResponse(null, { status: 200 });
}
