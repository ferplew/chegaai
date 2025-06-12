
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

const rawApiKeyFromEnv = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

// Log para ajudar na depuração - aparecerá no console do servidor Next.js
if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') { // Evitar log em produção, mas útil para dev
    console.log(`[Genkit Init Debug] Raw NEXT_PUBLIC_GEMINI_API_KEY from env: "${rawApiKeyFromEnv}" (Type: ${typeof rawApiKeyFromEnv})`);
}

const GEMINI_API_KEY_PLACEHOLDER = "AIzaSyCBWJQH6K_ZPdjzGZKBuYw9m3fYbhQhjso";
// Prioritize environment variable, fallback to placeholder only if env var is not set or is empty.
const GEMINI_API_KEY = rawApiKeyFromEnv || GEMINI_API_KEY_PLACEHOLDER;

if (!rawApiKeyFromEnv || rawApiKeyFromEnv === GEMINI_API_KEY_PLACEHOLDER) {
  let warningMessage =
    '*********************************************************************\n' +
    'ALERTA CRÍTICO: A chave da API Gemini NÃO ESTÁ CONFIGURADA ou é um VALOR PADRÃO.\n' +
    'As funcionalidades de IA que requerem a API Gemini FALHARÃO, provavelmente causando Erros Internos do Servidor (Internal Server Errors).\n' +
    'Por favor, defina uma NEXT_PUBLIC_GEMINI_API_KEY válida no seu arquivo .env.local.\n' +
    'Exemplo: NEXT_PUBLIC_GEMINI_API_KEY=AIzaSuaChaveDeAPIAqui...\n' +
    'Após configurar, REINICIE seu servidor de desenvolvimento/produção.\n' +
    'Verifique os logs do servidor para mensagens de erro detalhadas se o problema persistir.\n' +
    '*********************************************************************';

  if (!rawApiKeyFromEnv) {
    warningMessage = warningMessage.replace('NÃO ESTÁ CONFIGURADA ou é um VALOR PADRÃO', 'NÃO ESTÁ CONFIGURADA (está faltando ou vazia)');
  } else if (rawApiKeyFromEnv === GEMINI_API_KEY_PLACEHOLDER) {
    warningMessage = warningMessage.replace('NÃO ESTÁ CONFIGURADA ou é um VALOR PADRÃO', 'está definida com o VALOR PADRÃO (placeholder)');
  }
  
  if (typeof window === 'undefined') { // Server-side
    console.error(warningMessage); // Use console.error para maior visibilidade
  } else { // Client-side (menos provável para esta inicialização, mas para completar)
    console.warn(warningMessage);
  }
}


export const ai = genkit({
  plugins: [googleAI({ apiKey: GEMINI_API_KEY })],
  model: 'googleai/gemini-2.0-flash', // Default model for text generation
});

