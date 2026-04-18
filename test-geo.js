require('dotenv').config({ path: '.env' });

async function testGeo() {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=Ardennes&key=${process.env.GOOGLE_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  console.log(JSON.stringify(data.results[0]?.geometry?.location));
}
testGeo();
