import { GoogleGenAI, Chat } from "@google/genai";
import { 
  PROMPT_TRANSCRIPTION, 
  PROMPT_CLASSIFICATION, 
  PROMPT_SYNTHESIS 
} from '../constants';
import { 
  Snippet, 
  ClassifiedItem, 
  Relation, 
  StrategyResult 
} from '../types';

const apiKey = process.env.API_KEY || '';

// Initialize specific models for different tasks
// Using gemini-2.5-flash for vision (speed/cost efficiency) and gemini-3-pro-preview for complex reasoning
const genAI = new GoogleGenAI({ apiKey });

export const transcribeImage = async (base64Image: string): Promise<Snippet[]> => {
  if (!apiKey) throw new Error("API Key is missing");

  // Remove data URL prefix if present for the API call
  const base64Data = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');

  try {
    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/png', // Assuming PNG for simplicity, API handles standard types
              data: base64Data
            }
          },
          { text: PROMPT_TRANSCRIPTION }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2, // Low temperature for extraction accuracy
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    return JSON.parse(text) as Snippet[];
  } catch (error) {
    console.error("Transcription Error:", error);
    throw error;
  }
};

export const classifySnippets = async (snippets: Snippet[]): Promise<{ items: ClassifiedItem[]; relations: Relation[] }> => {
  if (!apiKey) throw new Error("API Key is missing");

  try {
    const response = await genAI.models.generateContent({
      model: 'gemini-3-pro-preview', // Stronger reasoning for classification
      contents: {
        parts: [
          { text: PROMPT_CLASSIFICATION },
          { text: `Here are the snippets: ${JSON.stringify(snippets)}` }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    return JSON.parse(text);
  } catch (error) {
    console.error("Classification Error:", error);
    throw error;
  }
};

export const synthesizeStrategy = async (
  items: ClassifiedItem[], 
  relations: Relation[]
): Promise<StrategyResult> => {
  if (!apiKey) throw new Error("API Key is missing");

  try {
    const inputPayload = JSON.stringify({ items, relations });
    
    const response = await genAI.models.generateContent({
      model: 'gemini-3-pro-preview', // Strongest reasoning for synthesis
      contents: {
        parts: [
          { text: PROMPT_SYNTHESIS },
          { text: `Here is the classified structure: ${inputPayload}` }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        temperature: 0.5, // Slightly higher for creative synthesis
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    return JSON.parse(text) as StrategyResult;
  } catch (error) {
    console.error("Synthesis Error:", error);
    throw error;
  }
};

export const createStrategyChat = (contextData: string): Chat => {
  if (!apiKey) throw new Error("API Key is missing");
  
  return genAI.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: `You are an expert business strategy consultant. 
      You are currently analyzing a strategy board with the following structure:
      ${contextData}
      
      Your goal is to help the user understand, refine, and execute this strategy. 
      Answer questions specifically about the OKRs, risks, timeline, and action items provided above.
      Be concise, professional, and actionable.
      `
    }
  });
};
