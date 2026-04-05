/**
 * @fileOverview AI Hub for explaining and auditing code.
 * Optimized for Gemini 2.5 Flash Lite.
 */

import { getGenkit } from '@/ai/genkit';
import { 
  AiCodeExplanationAndDebuggingOutputSchema,
  type AiCodeExplanationAndDebuggingInput,
  type AiCodeExplanationAndDebuggingOutput 
} from '@/ai/schemas';

/**
 * Logic for analyzing code for bugs and logic improvements.
 */

export async function aiCodeExplanationAndDebuggingInternal(input: AiCodeExplanationAndDebuggingInput): Promise<AiCodeExplanationAndDebuggingOutput> {
  try {
    console.log("ANALYSIS START. Key present:", !!input.apiKey, "Preview:", input.apiKey?.slice(0, 5) + "...");
    const genkitInstance = getGenkit(input.apiKey);

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
      prompt: `You are an Autonomous AI Debugger and Architect using Gemini 2.5 Flash Lite. 

CONTEXT: ${input.userContext || 'General code review and refinement'}
SECURITY SCAN: ${input.isSecurityScan ? 'CRITICAL - Find all vulnerabilities' : 'Logical/Architectural refinement'}

WORKSPACE CONTEXT:
${(input.filesToAnalyze || []).map((f: any) => `### File: ${f.fileName}\n\`\`\`\n${f.fileContent}\n\`\`\``).join('\n\n')}

STRICT RULES:
1. Complete code only. No placeholders.
2. If issues are found, provide fix operations in the JSON output.
3. Your goal is to refine and improve the existing architecture based on the user's context.`,
      output: { schema: AiCodeExplanationAndDebuggingOutputSchema }
    });

    if (!output) throw new Error('AI failed to generate analysis.');
    
    return JSON.parse(JSON.stringify(output));
  } catch (error: any) {
    console.error("AI ANALYSIS CRASHED:", error);
    return {
      explanation: `Analysis Crash: ${error.message}`,
      potentialIssues: [],
      suggestions: [],
      summary: "The analysis engine encountered a critical failure.",
      operations: []
    };
  }
}
