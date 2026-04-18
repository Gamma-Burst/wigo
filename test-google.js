const fetch = require('node-fetch');
require('dotenv').config({ path: '.env' });

async function testGoogleApi() {
  const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
  if (!GOOGLE_API_KEY) {
    console.error("No GOOGLE_API_KEY found in .env");
    return;
  }

  console.log("Testing Places API (New) with key:", GOOGLE_API_KEY.slice(0, 10) + "...");

  try {
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
          textQuery: "The Savoy hotel London",
          maxResultCount: 1,
          languageCode: "fr",
        }),
      }
    );

    const status = searchRes.status;
    const data = await searchRes.json();

    console.log(`\nHTTP Status: ${status}`);
    
    if (!searchRes.ok) {
      console.error("Google API Error Response:", JSON.stringify(data, null, 2));
    } else {
      console.log("Success! Data:", JSON.stringify(data, null, 2));
      
      if (data.places?.[0]?.photos?.[0]) {
        console.log("\nFound a photo name:", data.places[0].photos[0].name);
        const photoUrl = `https://places.googleapis.com/v1/${data.places[0].photos[0].name}/media?maxWidthPx=800&key=${GOOGLE_API_KEY}`;
        console.log("Generated URL:", photoUrl);
      } else {
        console.log("\nNo photos found for this place in the response.");
      }
    }
  } catch (error) {
    console.error("Fetch failed entirely:", error);
  }
}

testGoogleApi();
