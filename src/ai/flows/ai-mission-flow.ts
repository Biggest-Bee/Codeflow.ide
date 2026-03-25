'use server';
/**
 * @fileOverview A Genkit flow for processing autonomous AI Missions.
 * Missions are high-level tasks that the AI comprehends and executes against a workspace (Build or Debug).
 * Uses Gemini 2.0 Flash for high-precision mission execution.
 * Enforces strict preservation of files/folders and dependency integration.
 */

import { ai, getGenkit } from '@/ai/genkit';
import { z } from 'genkit';

function validateFilePath(path: string): boolean {
  if (!path || typeof path !== 'string') return false;
  return !(path.includes('..') || path.includes('~') || path.includes('\0'));
}

const FileOperationSchema = z.object({
  type: z.enum(['createFile', 'updateFile', 'deleteFile', 'renameFile', 'createFolder', 'moveNode']),
  path: z.string().describe('The path of the file or folder').refine(validateFilePath, "Invalid file path"),
  content: z.string().optional().describe('Clean, production-ready code content.'),
  newName: z.string().optional().describe('New name for renaming'),
});

const AiMissionInputSchema = z.object({
  missionTitle: z.string(),
  missionDescription: z.string(),
  workspaceContext: z.array(z.object({
    path: z.string(),
    type: z.enum(['file', 'folder']),
    content: z.string().optional()
  })),
  apiKey: z.string().optional(),
});
export type AiMissionInput = z.infer<typeof AiMissionInputSchema>;

const AiMissionOutputSchema = z.object({
  analysis: z.string().describe('Deep architectural analysis of the mission objective.'),
  operations: z.array(FileOperationSchema).optional().describe('Actionable file operations to fulfill the mission.'),
  summary: z.string().describe('A brief summary of what was accomplished.'),
});
export type AiMissionOutput = z.infer<typeof AiMissionOutputSchema>;

export async function processAiMission(input: AiMissionInput): Promise<AiMissionOutput> {
  return aiMissionFlow(input);
}

const aiMissionFlow = ai.defineFlow(
  {
    name: 'aiMissionFlow',
    inputSchema: AiMissionInputSchema,
    outputSchema: AiMissionOutputSchema,
  },
  async (input) => {
    // Dynamic Initialization: Key is validated and used only at runtime.
    const genkitInstance = getGenkit(input.apiKey);

    const contextText = input.workspaceContext
      .map(node => `### ${node.type}: ${node.path}\n${node.content ? `\`\`\`\n${node.content}\n\`\`\`` : '(Folder)'}`)
      .join('\n\n');

    const { output } = await genkitInstance.generate({
      model: 'googleai/gemini-2.0-flash',
      prompt: `You are an Autonomous AI Architect. You have been assigned a specialized "Mission".

MISSION OBJECTIVE: ${input.missionTitle}
DESCRIPTION: ${input.missionDescription}

Analyze the workspace context below and determine the best course of action to fulfill this mission. 
If the mission is debugging-oriented (e.g. security check, fixing errors), identify vulnerabilities and generate fix operations.
If the mission is build-oriented, architect the new features or structures requested.

STRICT RULES:
1. Provide COMPLETE code in your operations.
2. PRESERVATION RULE: If the user explicitly requests to keep a file, folder, or specific feature unchanged, you MUST respect this. DO NOT modify or remove any files the user has specifically flagged for preservation.
3. DEPENDENCY INTEGRATION: If configuration files (package.json, pom.xml) exist in the workspace context, you MUST NOT remove existing dependencies. Always merge new requirements with existing ones.
4. If no changes are needed, explain why in your analysis.
5. Be surgical. Only modify what is necessary to achieve the mission objective.
6. ROOT FILE RULE: Essential configuration files and entry points MUST be placed at the root of the workspace.
7. FEATURE PRESERVATION: Do NOT remove or modify existing features unless explicitly requested. If the user says to keep a feature, you MUST integrate your changes around it.
8. MODULARITY RULE: For any new architectural components, ensure a modular approach with AT LEAST 3 root folders (or 5+ for enterprise builds).
9. NO EMPTY ASSETS: NEVER create a folder that does not contain at least one file. NEVER create empty files. All operations must result in functional code. If you create a folder, you MUST put a file in it.

WORKSPACE CONTEXT:
${contextText}`,
      output: { schema: AiMissionOutputSchema }
    });

    if (!output) throw new Error('AI failed to process the mission. Ensure your API Key is valid and active.');
    return output;
  }
);
