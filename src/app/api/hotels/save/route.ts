import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient }
const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export async function POST(req: Request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { hotelId, name, location, imageUrl, price, currency, rating, vibe } = body;

        if (!hotelId || !name) {
            return new NextResponse("Missing required hotel data", { status: 400 });
        }

        // First, ensure the User exists in our DB (they might have just signed up via Clerk)
        const user = await prisma.user.upsert({
            where: { clerkUserId: userId },
            update: {},
            create: {
                clerkUserId: userId,
                email: "placeholder@clerk.com", // In a real app, fetch email from Clerk user obj
                name: "WIGO User",
            }
        });

        // Check if church already saved
        const existingSave = await prisma.savedHotel.findFirst({
            where: {
                userId: user.id,
                hotelId: hotelId.toString()
            }
        });

        if (existingSave) {
            // Un-save (Toggle behavior)
            await prisma.savedHotel.delete({
                where: { id: existingSave.id }
            });
            return NextResponse.json({ saved: false, message: "Hôtel retiré des favoris" }, { status: 200 });
        }

        // Save new hotel
        const savedHotel = await prisma.savedHotel.create({
            data: {
                userId: user.id,
                hotelId: hotelId.toString(),
                name,
                location: location || "Emplacement inconnu",
                imageUrl,
                price: price ? parseFloat(price) : null,
                currency: currency || "EUR",
                rating: rating ? parseFloat(rating) : null,
                vibe: vibe || null,
            }
        });

        return NextResponse.json({ saved: true, data: savedHotel }, { status: 200 });

    } catch (error) {
        console.error("[HOTEL_SAVE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
