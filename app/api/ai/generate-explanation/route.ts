import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Fallback to avoid crash if env is missing during build
const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: Request) {
    try {
        if (!apiKey) {
            console.error("❌ MISSING GEMINI_API_KEY in environment variables");
            return NextResponse.json({ error: "AI configuration missing" }, { status: 500 });
        }

        const body = await req.json();
        const { text, options, type } = body;

        // Try adding '-latest'
        const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });
        // const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

        // Find the correct answer text to help the AI explain the right path
        const correctAnswer = options?.find((o: any) => o.is_correct)?.text || "the provided solution";

        const prompt = `
                    Context: IGCSE/A-Level Math & Science.
                    Question: ${text}
                    Correct Answer: ${correctAnswer}
                    
                    Task: Write a "Socratic" explanation. 
                    1. Start with a 1-sentence "Concept" summary.
                    2. Use a numbered list for steps.
                    3. Use bolding for key terms.
                    4. Use $$...$$ for standalone equations and $...$ for inline math.
                    5. Tone: Encouraging mentor.
                    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const explanation = response.text();

        return NextResponse.json({ explanation });
    } catch (error: any) {
        // This will show up in your terminal where the Next.js server is running
        console.error("❌ AI ROUTE ERROR:", error.message || error);
        return NextResponse.json({
            error: "Failed to generate explanation",
            details: error.message
        }, { status: 500 });
    }
}