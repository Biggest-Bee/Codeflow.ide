import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * Global Genkit instance used for defining flows, prompts, and schemas.
 * Initialized without plugins at the top level to avoid build-time crashes
 * when API keys are missing.
 */
export const ai = genkit({});

/**
 * Helper to get a specialized Genkit instance for BYOK (Bring Your Own Key).
 * Dynamically initializes the Google AI plugin with the provided key or system fallback.
 * Throws a clear error if no key is available, preventing FAILED_PRECONDITION errors.
 */
export function getGenkit(apiKey?: string) {
  const key = apiKey || process.env.GEMINI_API_KEY;
  
  if (!key || key === 'placeholder' || key === '') {
    throw new Error(
      'API Key is missing. Please add a Gemini API key in the Configs tab, ' +
      'and ensure you have clicked on a key to "Activate" it for this session.'
    );
  }
  
  return genkit({
    plugins: [
      googleAI({ apiKey: key }),
    ],
  });
}
