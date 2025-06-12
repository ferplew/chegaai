
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

const GEMINI_API_KEY_PLACEHOLDER = "AIzaSyCBWJQH6K_ZPdjzGZKBuYw9m3fYbhQhjso";
// Prioritize environment variable, fallback to placeholder only if env var is not set.
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || GEMINI_API_KEY_PLACEHOLDER;

if (!GEMINI_API_KEY || GEMINI_API_KEY === GEMINI_API_KEY_PLACEHOLDER) {
  const warningMessage =
    '---------------------------------------------------------------------\n' +
    'WARNING: Gemini API key is not configured or is using a placeholder.\n' +
    'AI features requiring the Gemini API will likely fail.\n' +
    'Please set a valid NEXT_PUBLIC_GEMINI_API_KEY in your .env.local file.\n' + // Changed to .env.local
    'Example: NEXT_PUBLIC_GEMINI_API_KEY=AIza...........................\n' +
    'After setting it, restart your development server.\n' +
    '---------------------------------------------------------------------';
  
  if (typeof window === 'undefined') {
    // Server-side warning
    console.warn(warningMessage);
  } else {
    // Client-side warning (though less likely for this specific init, good for consistency)
    // For client-side visibility during dev, you might consider a more visible warning if needed.
    // However, API keys should ideally not be directly exposed client-side without proxying.
    // For now, the server console warning is most relevant for Genkit init.
  }
} else if (process.env.NEXT_PUBLIC_GEMINI_API_KEY === GEMINI_API_KEY_PLACEHOLDER && GEMINI_API_KEY === GEMINI_API_KEY_PLACEHOLDER){
  // This case means NEXT_PUBLIC_GEMINI_API_KEY was explicitly set to the placeholder.
   const specificWarning =
    '---------------------------------------------------------------------\n' +
    'WARNING: NEXT_PUBLIC_GEMINI_API_KEY in .env.local is set to the placeholder value.\n' +
    'AI features will likely fail. Please use a valid API key.\n' +
    '---------------------------------------------------------------------';
  if (typeof window === 'undefined') {
    console.warn(specificWarning);
  }
}


export const ai = genkit({
  plugins: [googleAI({ apiKey: GEMINI_API_KEY })],
  model: 'googleai/gemini-2.0-flash', // Default model for text generation
});
