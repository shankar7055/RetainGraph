import Groq from 'groq-sdk';
import dotenv from 'dotenv';
dotenv.config();

if (!process.env.GROQ_API_KEY) {
  console.error("FATAL ERROR: GROQ_API_KEY is not set in environment variables.");
  process.exit(1);
}

export const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
