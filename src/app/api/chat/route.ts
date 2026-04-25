import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const SYSTEM_CONTEXT = `Tu es WigoAI, l'assistant personnel de voyage et loisirs de WIGO. Tu es expert en tourisme européen : hôtels, randonnées, événements, restaurants, châteaux, parcs animaliers, brocantes et toutes les activités de loisirs.

Ton style : enthousiaste, chaleureux, concis (3-4 phrases max + suggestion), toujours en français.
Tu donnes des conseils rares, secrets, que les autres sites ne donnent pas.
Tu proposes toujours une suggestion ou question de suivi.
Utilise des emojis pour rendre la conversation vivante.`;

export async function POST(req: Request) {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return NextResponse.json({ error: "Messages requis" }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
        return NextResponse.json({
            reply: "🔑 Clé API non configurée. Contactez le support WIGO.",
        });
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // Build a single prompt with full conversation history
        const historyText = messages
            .slice(0, -1)
            .map((m: { role: string; content: string }) =>
                m.role === "user" ? `Utilisateur: ${m.content}` : `WigoAI: ${m.content}`
            )
            .join("\n");

        const lastMessage = messages[messages.length - 1].content;

        const fullPrompt = `${SYSTEM_CONTEXT}

${historyText ? `Historique de conversation:\n${historyText}\n\n` : ""}Utilisateur: ${lastMessage}

WigoAI:`;

        const result = await model.generateContent(fullPrompt);
        const reply = result.response.text().trim();

        return NextResponse.json({ reply });
    } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        console.error("WigoAI chat error:", errMsg);
        return NextResponse.json({
            reply: "Je n'arrive pas à répondre pour le moment. Réessayez dans quelques instants.",
        });
    }
}
