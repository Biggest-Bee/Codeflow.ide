'use server';
/**
 * @fileOverview Synthesis engine for generating and building code.
 * Optimized for Gemini 2.5 Flash.
 * 
 * - generateCodeInternal - Logic for generating code based on user prompt and workspace context.
 */

import { getGenkit } from '@/ai/genkit';
import { 
  type AiCodeGenerationInput,
  type AiCodeGenerationOutput,
  AiCodeGenerationOutputSchema
} from '@/ai/schemas';

export async function generateCodeInternal(input: AiCodeGenerationInput): Promise<AiCodeGenerationOutput> {
  try {
    console.log("SYNTHESIS START. Key present:", !!input.apiKey, "Preview:", input.apiKey?.slice(0, 5) + "...");
    
    const context = input.workspaceContext || [];
    if (context.length > 50) throw new Error('Workspace context too large (max 50 files).');

    const genkitInstance = getGenkit(input.apiKey);

    const workspaceContextText = context.map((node: any) => 
      "- " + node.type + ": " + node.path + (node.content ? "\n(Content: " + node.content.slice(0, 3000) + "...)" : "")
    ).join('\n');

    const strategyMap = {
      'single-file': "One file in the root. No folders.",
      'modular': "STRICT MODULAR ARCHITECTURE: You MUST create AT LEAST 4 distinct root folders directly in the PROJECT ROOT. EACH of these 4+ root folders MUST contain between 0 and 3 nested subfolders. EVERY single folder created MUST contain at least one functional logic file (.ts or .tsx) with real code. Essential root files (package.json, next.config.ts, tailwind.config.ts, src/app/page.tsx) MUST exist.",
      'highly-decoupled': "ULTRA-DECOUPLED ENTERPRISE ARCHITECTURE: You MUST create AT LEAST 8 distinct root folders directly in the PROJECT ROOT. EACH of these 8+ root folders MUST contain between 0 and 6 nested subfolders to properly distribute logic. You MUST also generate 6 to 8 functional files DIRECTLY in the PROJECT ROOT directory (e.g., configurations, global types, entry points, styles, globals.css). EVERY single directory created (root and subfolder) MUST contain functional logic files (.ts or .tsx). If you fail to provide at least 8 root folders and the requested root files, the build will be rejected."
    };

    const { output } = await genkitInstance.generate({
      model: 'googleai/gemini-2.5-flash-lite',
      config: {
        maxOutputTokens: 8192,
        temperature: 0.2,
        safetySettings: [
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
        ],
      },
      prompt: `You are an elite Software Architect using Gemini 2.5 Flash. 

DESIGN STRATEGY: ${strategyMap[input.designStrategy as keyof typeof strategyMap] || 'Modular'}
COMPLEXITY: ${input.complexityLevel || 'Medium'}
LANGUAGES: ${(input.languages || []).join(', ') || 'Industry standard'}

WORKSPACE CONTEXT:
${workspaceContextText}

USER REQUEST: ${input.userPrompt}

STRICT ARCHITECTURAL RULES (NON-NEGOTIABLE):
1. Provide COMPLETE code. NO PLACEHOLDERS.
2. PRESERVATION: BUILD AROUND existing files if they exist, but ensure the root is NEVER empty.
3. DIRECTORY HIERARCHY: 
   - Root Folders: MUST be directly in the project root.
   - For Modular Strategy: AT LEAST 4 ROOT FOLDERS, EACH containing 0-3 SUBFOLDERS.
   - For Highly Decoupled Strategy: AT LEAST 8 ROOT FOLDERS, EACH containing between 0 and 6 NESTED SUBFOLDERS.
   - ZERO GHOST FOLDERS: EVERY folder created (root and nested) MUST contain a functional logic file (.ts or .tsx).
4. ROOT FILES: 
   - Essential configuration and entry points MUST exist in the root hierarchy.
   - For Highly Decoupled: You MUST have 6-8 functional files directly in the PROJECT ROOT.
5. Return a list of file operations to execute the build.`,
      output: { schema: AiCodeGenerationOutputSchema }
    });

    if (!output) throw new Error('AI failed to synthesize valid code.');
    
    return JSON.parse(JSON.stringify(output));
  } catch (error: any) {
    console.error("AI GENERATION CRASHED:", error);
    return {
      generatedCode: "",
      explanation: `Internal Error: ${error.message || "Unknown error during synthesis"}`,
      operations: []
    } as any;
  }
}
