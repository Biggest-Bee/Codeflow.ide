import { genkit, Genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
 
/**
 * @fileOverview Genkit initialization hub with instance caching for serverless stability.
 */

// CACHE: Prevents plugin registry crashes and memory leaks in serverless environments.
const genkitInstances = new Map<string, Genkit>();

/**
 * Helper to get a specialized Genkit instance for BYOK (Bring Your Own Key).
 * Dynamically initializes the Google AI plugin with the provided key or system fallback.
 */
export function getGenkit(apiKey?: string) {
  // CRITICAL: Determine the actual key before any plugin registration
  const keyToUse = apiKey || process.env.GEMINI_API_KEY;
  
  if (!keyToUse || keyToUse === 'placeholder' || keyToUse === '') {
    throw new Error(
      'API Key is missing. Please add a Gemini API key in the Configs tab, ' +
      'and ensure you have clicked on a key to "Activate" it for this session.'
    );
  }
  
  // Return cached instance if it exists for this specific key
  if (genkitInstances.has(keyToUse)) {
    return genkitInstances.get(keyToUse)!;
  }

  // Initialize and cache a new instance
  // NOTE: Using the GA version of the Lite model for stability
  const newInstance = genkit({
    plugins: [
      googleAI({ apiKey: keyToUse }),
    ],
  });
  
  genkitInstances.set(keyToUse, newInstance);
  return newInstance;
}
