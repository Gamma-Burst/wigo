import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import prisma from '@/utils/prisma';

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookingId } = await req.json();

    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID requis." }, { status: 400 });
    }

    // Update status to PAID or CONFIRMED
    const booking = await prisma.booking.update({
      where: { 
        id: bookingId,
        userId: user.id // Safety check
      },
      data: {
        status: 'PAID'
      }
    });

    console.log(`[BOOKING] Booking ${bookingId} marked as PAID`);

    return NextResponse.json({ success: true, booking });

  } catch (error) {
    console.error("[COMPLETE_BOOKING_ERROR]", error);
    return NextResponse.json({ error: "Erreur lors de la finalisation de la réservation." }, { status: 500 });
  }
}
