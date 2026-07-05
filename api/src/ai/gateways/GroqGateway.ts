import Groq from 'groq-sdk';
import dotenv from 'dotenv';
dotenv.config();

if (!process.env.GROQ_API_KEY) {
  console.error("FATAL ERROR: GROQ_API_KEY is not set in environment variables.");
  process.exit(1);
}

export class GroqGateway {
  private client: Groq;

  constructor() {
    this.client = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }

  public async getChatCompletion(messages: any[], responseFormat?: { type: 'json_object' }) {
    const params: any = {
      messages,
      model: process.env.GROQ_MODEL || 'openai/gpt-oss-20b',
      temperature: 0.1,
      max_tokens: 4096,
    };
    if (responseFormat) {
      params.response_format = responseFormat;
    }

    let retries = 3;
    let delay = 3000;
    while (retries > 0) {
      try {
        return await this.client.chat.completions.create(params);
      } catch (error: any) {
        if (error.status === 429 && retries > 1) {
          console.warn(`[GroqGateway] Rate limit hit (429). Retrying in ${delay}ms...`);
          await new Promise((res) => setTimeout(res, delay));
          retries--;
          delay *= 2;
        } else {
          throw error;
        }
      }
    }
    throw new Error('Groq API failed after max retries.');
  }
}

export const groqGateway = new GroqGateway();
