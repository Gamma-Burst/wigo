/**
 * Photo Provider — Google Places API for real hotel images
 * Searches hotel by name + city, retrieves actual photos.
 * Falls back to Unsplash generic images if Google fails.
 */

const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_API_KEY;

// In-memory cache to avoid repeated API calls for the same hotel
const photoCache = new Map<string, string[]>();

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=800&q=80",
  "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80",
  "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
  "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800&q=80",
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
  "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80",
  "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&q=80",
  "https://images.unsplash.com/photo-1455587734955-081b22074882?w=800&q=80",
  "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80",
];

interface PlaceSearchResult {
  places?: Array<{
    id: string;
    displayName?: { text: string };
    photos?: Array<{
      name: string;
      widthPx: number;
      heightPx: number;
    }>;
  }>;
}

/**
 * Search Google Places for a hotel and return real photo URLs.
 * Uses the new Google Places API (v1).
 */
export async function getHotelPhotos(
  hotelName: string,
  city: string,
  maxPhotos: number = 3
): Promise<string[]> {
  // Check cache first
  const cacheKey = `${hotelName}|${city}`.toLowerCase();
  if (photoCache.has(cacheKey)) {
    return photoCache.get(cacheKey)!;
  }

  if (!GOOGLE_API_KEY) {
    console.warn("[PHOTOS] No GOOGLE_API_KEY, using fallbacks");
    return [];
  }

  try {
    // Step 1: Text Search to find the place
    const searchRes = await fetch(
      "https://places.googleapis.com/v1/places:searchText",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": GOOGLE_API_KEY,
          "X-Goog-FieldMask": "places.id,places.displayName,places.photos",
        },
        body: JSON.stringify({
          textQuery: `${hotelName} hotel ${city}`,
          maxResultCount: 1,
          languageCode: "fr",
        }),
      }
    );

    if (!searchRes.ok) {
      console.error(`[PHOTOS] Places search failed [${searchRes.status}]`);
      return [];
    }

    const data: PlaceSearchResult = await searchRes.json();
    const place = data.places?.[0];

    if (!place?.photos?.length) {
      console.log(`[PHOTOS] No photos found for "${hotelName}" in ${city}`);
      return [];
    }

    // Step 2: Build photo URLs (Google Places API v1 format)
    const photoUrls = place.photos.slice(0, maxPhotos).map((photo) => {
      return `https://places.googleapis.com/v1/${photo.name}/media?maxWidthPx=800&key=${GOOGLE_API_KEY}`;
    });

    // Cache the result
    photoCache.set(cacheKey, photoUrls);
    console.log(`[PHOTOS] Found ${photoUrls.length} real photos for "${hotelName}"`);

    return photoUrls;
  } catch (error) {
    console.error(`[PHOTOS] Error fetching photos for "${hotelName}":`, error);
    return [];
  }
}

/**
 * Get photos for a hotel, with Unsplash fallback.
 * Returns guaranteed array of at least 1 image.
 */
export async function getHotelPhotosWithFallback(
  hotelName: string,
  city: string,
  fallbackIndex: number = 0
): Promise<string[]> {
  const realPhotos = await getHotelPhotos(hotelName, city);

  if (realPhotos.length > 0) {
    return realPhotos;
  }

  // Fallback to Unsplash rotation
  return [
    FALLBACK_IMAGES[fallbackIndex % FALLBACK_IMAGES.length],
    FALLBACK_IMAGES[(fallbackIndex + 1) % FALLBACK_IMAGES.length],
    FALLBACK_IMAGES[(fallbackIndex + 2) % FALLBACK_IMAGES.length],
  ];
}

export { FALLBACK_IMAGES };
