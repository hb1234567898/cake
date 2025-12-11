import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateBirthdayWish = async (): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Write a short, heartwarming, and poetic birthday wish (max 20 words). Do not use quotes.",
      config: {
        thinkingConfig: { thinkingBudget: 0 } // Fast response needed
      }
    });
    return response.text.trim();
  } catch (error) {
    console.error("Failed to generate wish:", error);
    return "Wishing you a day filled with laughter and joy!";
  }
};
