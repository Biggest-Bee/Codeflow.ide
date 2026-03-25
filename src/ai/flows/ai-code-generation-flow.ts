'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating and building code.
 * It enforces modular design and security validation for file paths.
 * Uses Gemini 2.0 Flash for fast, architectural code generation.
 * Enforces strict 3+ and 5+ folder rules and preservation protocols.
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

const AiCodeGenerationInputSchema = z.object({
  userPrompt: z.string(),
  languages: z.array(z.string()).describe('List of languages to use. If empty, AI decides.'),
  autoSelectDependencies: z.boolean().optional().describe('If true, AI identifies and configures necessary npm packages.'),
  designStrategy: z.enum(['single-file', 'modular', 'highly-decoupled']),
  complexityLevel: z.enum(['simple', 'medium', 'complex']),
  apiKey: z.string().optional().describe('User-provided Gemini API key.'),
  workspaceContext: z.array(z.object({
    path: z.string(),
    type: z.enum(['file', 'folder']),
    content: z.string().optional()
  })).optional(),
});
export type AiCodeGenerationInput = z.infer<typeof AiCodeGenerationInputSchema>;

const AiCodeGenerationOutputSchema = z.object({
  generatedCode: z.string(),
  explanation: z.string(),
  operations: z.array(FileOperationSchema).optional(),
});
export type AiCodeGenerationOutput = z.infer<typeof AiCodeGenerationOutputSchema>;

export async function generateCode(input: AiCodeGenerationInput): Promise<AiCodeGenerationOutput> {
  return aiCodeGenerationFlow(input);
}

const aiCodeGenerationFlow = ai.defineFlow(
  {
    name: 'aiCodeGenerationFlow',
    inputSchema: AiCodeGenerationInputSchema,
    outputSchema: AiCodeGenerationOutputSchema,
  },
  async (input) => {
    const genkitInstance = getGenkit(input.apiKey);

    const workspaceContextText = input.workspaceContext 
      ? input.workspaceContext.map(node => `- ${node.type}: ${node.path}${node.content ? `\n(Content: ${node.content.slice(0, 100)}...)` : ''}`).join('\n')
      : 'No existing context.';

    const langRestriction = input.languages.length > 0 
      ? `STRICT LANGUAGE REQUIREMENT: You MUST use ALL of these languages in the project: ${input.languages.join(', ')}. Create a cohesive architecture.`
      : "No languages specified. Use a suitable set of modern tech.";

    const depRestriction = input.autoSelectDependencies
      ? `AUTO-DEPENDENCY DETECTION: You MUST identify all necessary npm packages. 
         1. List all identified dependencies in the relevant configuration file (e.g., package.json or pom.xml).
         2. IMPORTANT: You MUST NOT remove any existing dependencies found in configuration files in the Workspace Context. Merge new ones.
         3. You MUST write functional source code that utilizes these libraries.
         4. Ensure the project is immediately runnable.`
      : "No specific dependency automation requested.";

    const strategyMap = {
      'single-file': "Create only ONE file. Avoid folders. Keep names simple.",
      'modular': "Use a modular approach with AT LEAST 3 distinct folders at the root (3+ root folders). Keep names simple. Include nested folders inside them and essential files in the project root.",
      'highly-decoupled': "Use a complex architecture with AT LEAST 5 distinct folders at the root (5+ root folders). Keep names simple. Enforce deep architectural separation and strict separation of concerns. Include essential configuration files and entry points in the project root."
    };

    const { output } = await genkitInstance.generate({
      model: 'googleai/gemini-2.0-flash',
      prompt: `You are an elite Software Architect. 

${langRestriction}
${depRestriction}
DESIGN STRATEGY: ${strategyMap[input.designStrategy]}
COMPLEXITY: ${input.complexityLevel}

Workspace Context:
${workspaceContextText}

User Request: ${input.userPrompt}

STRICT OPERATIONAL RULES:
1. NEVER use placeholders. Generate COMPLETE source code.
2. PRESERVATION RULE: If the user explicitly requests to keep a file, folder, or specific feature unchanged, you MUST NOT modify it.
3. DEPENDENCY INTEGRATION: If configuration files (package.json, pom.xml) exist, you MUST NOT remove existing dependencies. Always merge.
4. ROOT FILE RULE: Essential configuration files and entry points MUST be placed at the root of the workspace to ensure the environment works correctly.
5. Every project MUST have a README.md at the root explaining the architecture.
6. Execute a sequence of file operations (createFolder, createFile, updateFile). 
7. CRITICAL: Ensure you emit createFolder operations for any directories before emitting createFile operations for files inside them.
8. FEATURE PRESERVATION: Do NOT remove or modify existing features unless explicitly requested. Build around them.
9. Keep names simple and professional.
10. NO EMPTY ASSETS: NEVER create a folder that does not contain at least one file. Do not create folders like 'docs', 'assets', or 'tests' if you are not placing functional files inside them. NEVER create empty files. If you create a folder, you MUST create a functional file inside it.`,
      output: { schema: AiCodeGenerationOutputSchema }
    });

    if (!output) throw new Error('Failed to generate response.');
    return output;
  }
);
