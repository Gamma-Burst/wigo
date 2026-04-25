import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2026-01-28.clover',
});

type BillingCycle = "monthly" | "annual";

const BILLING_PLANS: Record<BillingCycle, {
    interval: "month" | "year";
    label: string;
    unitAmount: number;
}> = {
    monthly: {
        interval: "month",
        label: "Mensuel",
        unitAmount: 999,
    },
    annual: {
        interval: "year",
        label: "Annuel",
        unitAmount: 8388,
    },
};

function getBillingCycle(req: Request): BillingCycle {
    const cycle = new URL(req.url).searchParams.get("billing");
    return cycle === "annual" ? "annual" : "monthly";
}

async function createCheckoutSession(
    req: Request,
    user: { id: string; email?: string | null },
    billing: BillingCycle
) {
    const url = new URL(req.url);
    const origin = process.env.NODE_SERVER_URL || url.origin;
    const plan = BILLING_PLANS[billing];

    return stripe.checkout.sessions.create({
        success_url: `${origin}/historique?success=true`,
        cancel_url: `${origin}/pricing?canceled=true`,
        payment_method_types: ['card'],
        mode: 'subscription',
        billing_address_collection: 'auto',
        allow_promotion_codes: true,
        customer_email: user.email || undefined,
        line_items: [
            {
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: `WIGO Pro ${plan.label}`,
                        description: 'AccÃ©dez Ã  toutes les recherches IA et lieux secrets en illimitÃ©.',
                    },
                    unit_amount: plan.unitAmount,
                    recurring: {
                        interval: plan.interval,
                    },
                },
                quantity: 1,
            }
        ],
        subscription_data: {
            trial_period_days: 7,
        },
        metadata: {
            billingCycle: billing,
            supabaseUserId: user.id,
        },
    });
}

export async function GET(req: Request) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.redirect(new URL("/login?redirect_url=/pricing", req.url));
        }

        const billing = getBillingCycle(req);
        const stripeSession = await createCheckoutSession(req, user, billing);

        if (!stripeSession.url) {
            return NextResponse.redirect(new URL("/pricing?error=checkout_unavailable", req.url));
        }

        return NextResponse.redirect(stripeSession.url);
    } catch (error: Error | unknown) {
        console.error("[STRIPE_ERROR]", error);
        return NextResponse.redirect(new URL("/pricing?error=checkout_failed", req.url));
    }
}

export async function POST(req: Request) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const billing = getBillingCycle(req);
        const stripeSession = await createCheckoutSession(req, user, billing);
        return NextResponse.json({ url: stripeSession.url });
    } catch (error: Error | unknown) {
        console.error("[STRIPE_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
