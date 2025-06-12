
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

const GEMINI_API_KEY_PLACEHOLDER = "AIzaSyCBWJQH6K_ZPdjzGZKBuYw9m3fYbhQhjso";
// Prioritize environment variable, fallback to placeholder only if env var is not set.
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || GEMINI_API_KEY_PLACEHOLDER;

if (!GEMINI_API_KEY || GEMINI_API_KEY === GEMINI_API_KEY_PLACEHOLDER) {
  const warningMessage =
    '*********************************************************************\n' +
    'CRITICAL WARNING: Gemini API key is NOT CONFIGURED or is a PLACEHOLDER.\n' +
    'AI features requiring the Gemini API WILL FAIL, likely causing Internal Server Errors.\n' +
    'Please set a valid NEXT_PUBLIC_GEMINI_API_KEY in your .env.local file.\n' +
    'Example: NEXT_PUBLIC_GEMINI_API_KEY=AIzaYourActualApiKey...\n' +
    'After setting it, RESTART your development/production server.\n' +
    '*********************************************************************';
  
  if (typeof window === 'undefined') { // Server-side
    console.error(warningMessage); // Use console.error for higher visibility
  } else { // Client-side (less likely for this init, but for completeness)
    console.warn(warningMessage);
  }
} else if (process.env.NEXT_PUBLIC_GEMINI_API_KEY === GEMINI_API_KEY_PLACEHOLDER && GEMINI_API_KEY === GEMINI_API_KEY_PLACEHOLDER){
  // This case means NEXT_PUBLIC_GEMINI_API_KEY was explicitly set to the placeholder.
   const specificWarning =
    '*********************************************************************\n' +
    'CRITICAL WARNING: NEXT_PUBLIC_GEMINI_API_KEY in .env.local is SET TO THE PLACEHOLDER value.\n' +
    'AI features WILL FAIL. Please use a valid API key and RESTART your server.\n' +
    '*********************************************************************';
  if (typeof window === 'undefined') {
    console.error(specificWarning);
  }
}


export const ai = genkit({
  plugins: [googleAI({ apiKey: GEMINI_API_KEY })],
  model: 'googleai/gemini-2.0-flash', // Default model for text generation
});

