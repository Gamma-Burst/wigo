import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const apiKey = process.env.GOOGLE_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "");

export async function POST(req: Request) {
    try {
        if (!apiKey) {
            return NextResponse.json({ error: "API key is not configured." }, { status: 500 });
        }

        const body = await req.json();
        const { hotels } = body;

        if (!hotels || !Array.isArray(hotels) || hotels.length < 2 || hotels.length > 3) {
            return NextResponse.json({ error: "Please provide 2 or 3 hotels to compare." }, { status: 400 });
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            generationConfig: {
                responseMimeType: "application/json",
            }
        });

        interface HotelInput {
            name: string;
            price: string;
            tags: string[];
        }
        const hotelDataStr = hotels.map((h: HotelInput) => `- ${h.name} (Prix: ${h.price}, Atouts: ${h.tags.join(', ')})`).join('\n');

        const prompt = `
En tant qu'agent de voyage expert, compare précisément ces hôtels pour aider l'utilisateur à choisir le meilleur selon ses envies :
${hotelDataStr}

Créé un JSON STRICT (sans markdown autour) avec cette structure exacte :
{
  "idealProfile": "Un petit paragraphe (2-3 phrases) résumant globalement quel type de voyageur serait le plus comblé par tel ou tel choix dans cette sélection.",
  "comparison": [
    {
      "hotelName": "Nom exact de l'hôtel 1",
      "pros": ["Point fort 1", "Point fort 2"],
      "cons": ["Inconvénient 1 (ex: Prix élevé, éloigné, etc.)"]
    },
    // Répéter pour chaque hôtel de la liste (exactement le même nombre)
  ]
}
`;

        const result = await model.generateContent(prompt);
        let responseText = result.response.text();

        if (responseText.startsWith("```json")) {
            responseText = responseText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (responseText.startsWith("```")) {
            responseText = responseText.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }

        const parsedData = JSON.parse(responseText);
        return NextResponse.json(parsedData);

    } catch (error) {
        console.error("Error with Gemini API for Hotel Comparison:", error);
        return NextResponse.json({ error: "Failed to fetch comparison." }, { status: 500 });
    }
}
