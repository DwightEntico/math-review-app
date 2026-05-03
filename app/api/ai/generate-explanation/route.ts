import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Fallback to avoid crash if env is missing during build
const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

// ✅ Add a helper to make sure the fetch actually works
async function getBase64Image(url: string) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch image from storage: ${response.statusText}`);
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer).toString("base64");
}

export async function POST(req: Request) {
    try {
        const { text, imageUrl, options, type } = await req.json();

        // Ensure API Key exists
        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: "API Key missing" }, { status: 500 });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });

        const parts: any[] = [
            {
                text: `Explain this IGCSE question solution step-by-step. Text: ${text}. 
               Options: ${options?.map((o: any) => o.text).join(", ")}. 
               Use LaTeX for math.` }
        ];

        // ✅ Only try to process the image if imageUrl is a valid string
        if (imageUrl && imageUrl.startsWith('http')) {
            try {
                const base64Data = await getBase64Image(imageUrl);
                parts.push({
                    inlineData: {
                        data: base64Data,
                        mimeType: "image/png", // Adjust if needed
                    },
                });
            } catch (imgErr) {
                console.error("Image Fetch Error:", imgErr);
                // We continue with just text if the image fetch fails
            }
        }

        const result = await model.generateContent({
            contents: [{ role: "user", parts }],
        });

        const response = await result.response;
        const output = response.text();

        return NextResponse.json({ explanation: output });

    } catch (error: any) {
        console.error("AI ROUTE ERROR:", error);
        return NextResponse.json({
            error: "Generation failed",
            details: error.message
        }, { status: 500 });
    }
}