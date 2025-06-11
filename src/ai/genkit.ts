
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// IMPORTANT: For production, use environment variables or secrets for API keys.
// const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_KEY = "AIzaSyCBWJQH6K_ZPdjzGZKBuYw9m3fYbhQhjso"; // User provided API Key

if (!GEMINI_API_KEY) {
  console.warn(
    'Gemini API key not found. Ensure it is correctly set.'
  );
}

export const ai = genkit({
  plugins: [googleAI({ apiKey: GEMINI_API_KEY })], // Explicitly pass API key
  model: 'googleai/gemini-2.0-flash', // Default model for text generation
});
