import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const generateContent = async (prompt: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: prompt,
    });
    return response.text;
  } catch (error: any) {
    console.error("Gemini generation error:", error);
    throw new Error(error?.message || "Failed to generate content");
  }
};
