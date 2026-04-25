import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import prisma from '@/utils/prisma';

async function ensureDbUser(user: { id: string; email?: string | null; user_metadata?: { full_name?: string } }) {
  let dbUser = await prisma.user.findUnique({ where: { id: user.id } });

  if (!dbUser && user.email) {
    dbUser = await prisma.user.create({
      data: {
        id: user.id,
        email: user.email,
        clerkUserId: user.id,
        name: user.user_metadata?.full_name || 'Voyageur WIGO',
      }
    });
  }

  return dbUser;
}

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { bookingId, bookingRequest, title, type, itemId, customerInfo } = body;
    const dbUser = await ensureDbUser(user);

    if (!dbUser) {
      return NextResponse.json({ error: "Utilisateur non trouvÃ© en base." }, { status: 404 });
    }

    if (bookingRequest) {
      if (!title || !type || !itemId) {
        return NextResponse.json({ error: "DonnÃ©es de demande incomplÃ¨tes." }, { status: 400 });
      }

      const booking = await prisma.booking.create({
        data: {
          userId: dbUser.id,
          type,
          itemId,
          title,
          amount: 0,
          status: 'REQUESTED',
          customerName: customerInfo?.name,
          customerEmail: customerInfo?.email || user.email,
          customerPhone: customerInfo?.phone,
        }
      });

      return NextResponse.json({ success: true, bookingId: booking.id, booking });
    }

    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID requis." }, { status: 400 });
    }

    const existingBooking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        userId: dbUser.id,
      }
    });

    if (!existingBooking) {
      return NextResponse.json({ error: "RÃ©servation introuvable." }, { status: 404 });
    }

    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'PAID'
      }
    });

    console.log(`[BOOKING] Booking ${bookingId} marked as PAID`);

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    console.error("[COMPLETE_BOOKING_ERROR]", error);
    return NextResponse.json({ error: "Erreur lors de la finalisation de la rÃ©servation." }, { status: 500 });
  }
}
