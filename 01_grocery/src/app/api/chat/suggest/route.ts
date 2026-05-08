import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { auth } from "@/auth";

export async function POST(request: NextRequest) {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const { messages, context } = await request.json();

        const prompt = `You are an AI assistant providing smart quick replies for a grocery delivery chat between a customer and a delivery boy.
Context: ${context}
Recent messages:
${messages.map((m: any) => `${m.sender}: ${m.text}`).join("\n")}

Provide exactly 3 short, human-like, helpful quick replies that the ${session.user?.role === "deliveryBoy" ? "delivery boy" : "customer"} can send.
Format the output as a JSON array of strings. Do not include any other text or markdown formatting. Example: ["I'm reaching in 5 mins", "Traffic is heavy", "Please keep OTP ready"]`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
        });

        let suggestions = ["I'll be there soon", "Okay", "Thanks!"];
        try {
            const text = (response as any)?.text;
            if (text) {
                const rawText = text.replace(/```json/g, '').replace(/```/g, '').trim();
                suggestions = JSON.parse(rawText);
            }
        } catch (e) {
            console.error("Failed to parse Gemini response", e);
        }

        return NextResponse.json({ suggestions }, { status: 200 });

    } catch (error) {
        console.error("Gemini AI error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
