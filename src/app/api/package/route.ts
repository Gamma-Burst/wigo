import { NextRequest, NextResponse } from "next/server";
import { extractFilters } from "@/services/ai-filters";
import { searchHotels } from "@/services/hotel-provider";
import { searchFlights } from "@/services/flight-provider";
import { searchActivities } from "@/services/activity-provider";

export const dynamic = "force-dynamic";

// Belgian/nearby airports where BRU flights make no sense
// Airports where flights from BRU makes no sense (Domestic or very close like Paris/Amsterdam)
const NO_FLIGHT_CODES = new Set(["BRU", "CRL", "LGG", "ANR", "OST", "QNM", "QMX", "LUX", "CDG", "ORY", "BVA", "PAR", "AMS", "LIL"]);

export async function POST(req: NextRequest) {
  try {
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { query } = body as { query: string };
    if (!query) return NextResponse.json({ error: "Missing query" }, { status: 400 });

    // 1. Extract intents using AI
    const filters = await extractFilters(query);
    if (!filters) {
      return NextResponse.json({ error: "AI extraction failed" }, { status: 500 });
    }

    // Prepare default dates for flights if none provided
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const departDate = filters.checkIn || nextMonth.toISOString().split("T")[0];

    let returnDate = filters.checkOut;
    if (!returnDate) {
      const returnDateObj = new Date(departDate);
      returnDateObj.setDate(returnDateObj.getDate() + 2);
      returnDate = returnDateObj.toISOString().split("T")[0];
    }

    const destCode = filters.iataCode || "";
    const isDomestic = NO_FLIGHT_CODES.has(destCode);

    // 2. Fetch all components of the Package asynchronously
    const [hotels, flights, activities] = await Promise.all([
      // Hotels
      searchHotels(filters).catch(() => []),

      // Flights — skip for domestic/nearby destinations (BRU → BRU makes no sense)
      isDomestic || !destCode
        ? Promise.resolve([])
        : searchFlights({
            origin: "BRU",
            destination: destCode,
            departDate,
            returnDate,
            adults: filters.guests || 2,
            nonStop: true,
          }).catch(() => []),

      // Activities
      (async () => {
        if (filters.latitude && filters.longitude) {
          return searchActivities(filters.latitude, filters.longitude).catch(() => []);
        }
        return [];
      })(),
    ]);

    // 3. Return the WIGO Passport payload
    return new NextResponse(JSON.stringify({
      passport: {
        destination: filters.locationDisplay,
        intent: query,
        hotels: hotels, // All results for more choice
        flights: flights.slice(0, 5), // Top 5
        activities: activities.slice(0, 10), // Top 10
        cityInsight: filters.cityInsight
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });

  } catch (error) {
    console.error("[PACKAGE_API_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
