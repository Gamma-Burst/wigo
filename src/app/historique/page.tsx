import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }
const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

import { GroupedHistory } from "./types";

import HistoryClientRender from "./HistoryClient";

export default async function HistoryPage() {
    const { userId } = await auth();

    try {
        // 1. Fetch user to check pro status
        const user = await prisma.user.findUnique({
            where: { clerkUserId: userId || "" }
        });

        const isPro = user?.isPro || false;

        // 2. Fetch Saved Hotels
        const savedHotels = await prisma.savedHotel.findMany({
            where: {
                user: {
                    clerkUserId: userId || ""
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Grouping by Vibe
        const groupedHotels: GroupedHistory = {};
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        savedHotels.forEach((h: any) => {
            const cat = h.vibe || "Toutes vos pépites";
            if (!groupedHotels[cat]) groupedHotels[cat] = [];

            groupedHotels[cat].push({
                id: h.id,
                hotelId: h.hotelId,
                name: h.name,
                price: h.price,
                imageUrl: h.imageUrl,
                vibe: h.vibe,
                tags: ["WIGO Verified", "Save"]
            });
        });

        return <HistoryClientRender initialData={groupedHotels} isPro={isPro} />
    } catch (error) {
        return (
            <div className="min-h-screen bg-background p-10 flex items-center justify-center">
                <div className="bg-red-50 text-red-600 p-6 rounded-2xl max-w-xl">
                    <h2 className="font-bold mb-2">Erreur Serveur (DEBUG)</h2>
                    <pre className="text-sm whitespace-pre-wrap">{String(error)}</pre>
                </div>
            </div>
        )
    }
}
