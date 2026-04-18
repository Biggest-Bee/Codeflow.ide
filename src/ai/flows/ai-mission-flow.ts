'use server';
/**
 * @fileOverview AI Mission Hub for autonomous tasks.
 * Optimized for Gemini 2.5 Flash.
 * 
 * - processAiMissionInternal - A function that handles complex autonomous missions.
 */

import { getGenkit } from '@/ai/genkit';
import { 
  AiMissionOutputSchema,
  type AiMissionInput,
  type AiMissionOutput 
} from '@/ai/schemas';

/**
 * Logic for processing complex autonomous missions.
 */
export async function processAiMissionInternal(input: AiMissionInput): Promise<AiMissionOutput> {
  try {
    console.log("MISSION START. Key present:", !!input.apiKey, "Preview:", input.apiKey?.slice(0, 5) + "...");
    const genkitInstance = await getGenkit(input.apiKey);

    const { output } = await genkitInstance.generate({
      model: 'googleai/gemini-2.5-flash-lite',
      config: {
        maxOutputTokens: 50000,
        temperature: 0.2,
        safetySettings: [
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
        ],
      },
      prompt: `You are an Autonomous AI Architect using Gemini 2.5 Flash Lite.

MISSION: ${input.missionTitle}
DESCRIPTION: ${input.missionDescription}

STRICT ARCHITECTURAL RULES (NON-NEGOTIABLE):
1. Provide COMPLETE code. No placeholders.
2. ARCHITECTURAL MODULARITY:
   - Root Folders: MUST be directly in the project root.
   - MODULAR BUILDS: At least 4 distinct root folders, EACH containing 0-3 nested sub-folders.
   - HIGHLY DECOUPLED BUILDS: At least 8 distinct root folders, EACH containing between 0 and 6 nested sub-folders to ensure deep architectural distribution.
   - ZERO GHOST FOLDERS: EVERY folder created (root and nested) MUST contain a functional file (.ts or .tsx) with real logic.
3. ROOT INTEGRITY:
   - Keep essential configuration and entry files in the PROJECT ROOT.
   - HIGHLY DECOUPLED BUILDS MUST have 6-8 functional files directly in the PROJECT ROOT directory (e.g., config, entry points, types).
   - Never leave the root directory empty of functional code files.`,
      output: { schema: AiMissionOutputSchema }
    });

    if (!output) throw new Error('AI failed to process the mission.');
    
    return JSON.parse(JSON.stringify(output));
  } catch (error: any) {
    console.error("AI MISSION CRASHED:", error);
    return {
      analysis: `Mission Error: ${error.message}`,
      summary: "The mission engine encountered a critical failure.",
      operations: []
    };
  }
}
