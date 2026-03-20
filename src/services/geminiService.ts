import { GoogleGenAI, Modality } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

export const getAI = () => {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  return new GoogleGenAI({ apiKey });
};

export async function generateTimeTravelImage(userImageBase64: string, sceneDescription: string) {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: userImageBase64.split(',')[1],
            mimeType: 'image/png',
          },
        },
        {
          text: `This is a photo of a person. Please create a high-quality historical scene of ${sceneDescription} and seamlessly integrate this person's face and likeness into the scene as a central character. The style should match the historical period. Output only the resulting image.`,
        },
      ],
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image generated");
}

export async function editImageWithPrompt(imageBase64: string, prompt: string) {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: imageBase64.split(',')[1],
            mimeType: 'image/png',
          },
        },
        {
          text: prompt,
        },
      ],
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image generated");
}

export async function analyzeHistoricalScene(imageBase64: string) {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: {
      parts: [
        {
          inlineData: {
            data: imageBase64.split(',')[1],
            mimeType: 'image/png',
          },
        },
        {
          text: "Analyze this historical scene. Identify the time period, key historical elements, and describe the atmosphere and details of the setting. Be educational and engaging.",
        },
      ],
    },
  });

  return response.text;
}
