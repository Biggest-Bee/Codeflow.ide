'use server';
/**
 * @fileOverview A Genkit flow for explaining and auditing code.
 * Uses Gemini 2.0 Flash for deep architectural analysis and autonomous fix generation.
 * Now generates a BUG_LOG.md for all applied fixes.
 * Enforces strict preservation of files/folders and dependency integration.
 */

import { ai, getGenkit } from '@/ai/genkit';
import { z } from 'genkit';

function validateFilePath(path: string): boolean {
  if (!path || typeof path !== 'string') return false;
  if (path.includes('..') || path.includes('~') || path.includes('\0')) {
    return false;
  }
  return true;
}

const FileOperationSchema = z.object({
  type: z.enum(['createFile', 'updateFile', 'deleteFile', 'renameFile', 'createFolder', 'moveNode']),
  path: z.string()
    .describe('The path of the file or folder')
    .refine(validateFilePath, "Invalid file path"),
  content: z.string().optional().describe('Clean, production-ready code content.'),
  newName: z.string().optional().describe('New name for renaming'),
});

const FileContentSchema = z.object({
  fileName: z.string().describe('The name of the file.'),
  fileContent: z.string().describe('The full content of the file.'),
});

const AiCodeExplanationAndDebuggingInputSchema = z.object({
  filesToAnalyze: z.array(FileContentSchema).describe('An array of files to analyze.'),
  apiKey: z.string().optional().describe('Optional user-provided Gemini API key.'),
  isSecurityScan: z.boolean().optional().describe('If true, focus heavily on finding security vulnerabilities.'),
  userContext: z.string().optional().describe('Additional context or specific issues mentioned by the user.'),
});
export type AiCodeExplanationAndDebuggingInput = z.infer<typeof AiCodeExplanationAndDebuggingInputSchema>;

const AiCodeExplanationAndDebuggingOutputSchema = z.object({
  explanation: z.string().describe('Explanation of the code.'),
  potentialIssues: z.array(z.string()).describe('List of potential issues.'),
  suggestions: z.array(z.string()).describe('Actionable suggestions.'),
  summary: z.string().describe('High-level summary of the analysis and fixes.'),
  operations: z.array(FileOperationSchema).optional().describe('Actionable file operations to fix identified issues.'),
});
export type AiCodeExplanationAndDebuggingOutput = z.infer<typeof AiCodeExplanationAndDebuggingOutputSchema>;

export async function aiCodeExplanationAndDebugging(
  input: AiCodeExplanationAndDebuggingInput
): Promise<AiCodeExplanationAndDebuggingOutput> {
  if (input.filesToAnalyze.length > 50) {
    throw new Error('Too many files provided. Maximum 50 files allowed.');
  }

  const totalSize = input.filesToAnalyze.reduce((sum, f) => sum + (f.fileContent?.length || 0), 0);
  if (totalSize > 500000) {
    throw new Error('Total file size is too large. Must be under 500KB.');
  }

  return aiCodeExplanationAndDebuggingFlow(input);
}

const aiCodeExplanationAndDebuggingFlow = ai.defineFlow(
  {
    name: 'aiCodeExplanationAndDebuggingFlow',
    inputSchema: AiCodeExplanationAndDebuggingInputSchema,
    outputSchema: AiCodeExplanationAndDebuggingOutputSchema,
  },
  async (input) => {
    // Dynamic Initialization: Instantiate Genkit only when the flow is executed.
    const genkitInstance = getGenkit(input.apiKey);

    const securityPrompt = input.isSecurityScan 
      ? "CRITICAL: This is an ELITE SECURITY SCAN. Focus on finding vulnerabilities like XSS, SQL injection, insecure storage, and hardcoded secrets. You MUST generate fix operations for every vulnerability found."
      : "Focus on finding logical bugs, performance issues, and architectural improvements. You MUST generate fix operations for any bugs found.";

    const { output } = await genkitInstance.generate({
      model: 'googleai/gemini-2.0-flash',
      prompt: `You are an Autonomous AI Debugger and Security Researcher. 

${securityPrompt}

Your mission is to analyze the provided files, identify every possible issue, and generate a set of "operations" that can be applied to FIX them in the actual workspace.

STRICT RULES:
1. NEVER use placeholders. Generate COMPLETE source code for any file updates.
2. PRESERVATION RULE: If the user explicitly requests to keep a file, folder, or specific feature unchanged, you MUST NOT modify it.
3. DEPENDENCY INTEGRATION: If configuration files like package.json or pom.xml are provided, you MUST NOT remove existing dependencies; you must integrate your fixes into the existing structure.
4. If you find a bug or a security issue, you MUST include an 'updateFile' operation to patch the actual source file, unless specified otherwise by the user.
5. ROOT FILE RULE: Essential configuration files and entry points MUST be placed at the root of the workspace.
6. BUG LOG RULE: If any fixes are made, you MUST generate an additional 'createFile' or 'updateFile' operation for a file named 'BUG_LOG.md' at the root of the workspace. This log must detail:
   - Specific problems identified.
   - Exact fixes applied.
   - The file paths that were modified.
7. Your analysis should be deep and architectural.
8. If .env file is spotted with actual stuff and not place holders, replace it with place holders.
9. User Context: ${input.userContext || "Perform a comprehensive general audit."}
10. FEATURE PRESERVATION: Do NOT remove or modify existing features unless explicitly requested. If the user says to keep a feature, you MUST integrate your fixes around it.
11. MODULARITY: Ensure that any new architectural suggestions follow a modular approach with AT LEAST 3 root folders (or 5+ for enterprise builds).
12. NO EMPTY ASSETS: NEVER create a folder that does not contain at least one file. NEVER create empty files. All operations must result in functional code. If you create a folder, you MUST create a file inside it.

WORKSPACE CONTEXT:
${input.filesToAnalyze.map(f => `### File: ${f.fileName}\n\`\`\`\n${f.fileContent}\n\`\`\``).join('\n\n')}`,
      output: { schema: AiCodeExplanationAndDebuggingOutputSchema }
    });
    
    if (!output) {
      throw new Error('AI failed to generate analysis. Ensure your API Key is valid and active.');
    }
    return output;
  }
);
