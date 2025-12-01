import { GoogleGenAI, Type } from "@google/genai";
import { Category } from '../types';

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

interface ScannedReceiptData {
  amountTHB: number;
  category: Category;
  description: string;
}

export const scanReceipt = async (base64Image: string): Promise<ScannedReceiptData | null> => {
  if (!apiKey) {
    console.warn("No API Key provided");
    return null;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image
            }
          },
          {
            text: `Analyze this receipt. Extract the total amount in THB. 
            Categorize it into one of these: Transport, Food, Drink, Weed, Purchase, Play, Other.
            Provide a very short description (max 4 words).
            If you cannot find a total, return 0.
            `
          }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            amountTHB: { type: Type.NUMBER },
            category: { 
              type: Type.STRING, 
              enum: [
                'Transport', 'Food', 'Drink', 'Weed', 
                'Purchase', 'Play', 'Other'
              ] 
            },
            description: { type: Type.STRING }
          },
          required: ['amountTHB', 'category', 'description']
        }
      }
    });

    const text = response.text;
    if (!text) return null;

    const data = JSON.parse(text) as ScannedReceiptData;
    return data;
  } catch (error) {
    console.error("Error scanning receipt:", error);
    return null;
  }
};