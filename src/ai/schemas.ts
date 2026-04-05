import { z } from 'genkit';

/**
 * @fileOverview Shared Zod schemas for AI flows.
 */

export function validateFilePath(path: string): boolean {
  if (!path || typeof path !== 'string') return false;
  return !(path.includes('..') || path.includes('~') || path.includes('\0'));
}

export const FileOperationSchema = z.object({
  type: z.enum(['createFile', 'updateFile', 'deleteFile', 'renameFile', 'createFolder', 'moveNode']),
  path: z.string().describe('The path of the file or folder').refine(validateFilePath, "Invalid file path"),
  content: z.string().optional().describe('Clean, production-ready code content.'),
  newName: z.string().optional().describe('New name for renaming'),
});

export type FileOperation = z.infer<typeof FileOperationSchema>;

// --- Generation Flow Schemas ---
export const AiCodeGenerationInputSchema = z.object({
  userPrompt: z.string(),
  languages: z.array(z.string()).describe('List of languages to use.'),
  autoSelectDependencies: z.boolean().optional(),
  designStrategy: z.enum(['single-file', 'modular', 'highly-decoupled']),
  complexityLevel: z.enum(['simple', 'medium', 'complex']),
  apiKey: z.string().optional(),
  workspaceContext: z.array(z.object({
    path: z.string(),
    type: z.enum(['file', 'folder']),
    content: z.string().optional()
  })).optional(),
});

export type AiCodeGenerationInput = z.infer<typeof AiCodeGenerationInputSchema>;

export const AiCodeGenerationOutputSchema = z.object({
  generatedCode: z.string(),
  explanation: z.string(),
  operations: z.array(FileOperationSchema).optional(),
});

export type AiCodeGenerationOutput = z.infer<typeof AiCodeGenerationOutputSchema>;

// --- Debugging Flow Schemas ---
export const AiCodeExplanationAndDebuggingInputSchema = z.object({
  filesToAnalyze: z.array(z.object({
    fileName: z.string(),
    fileContent: z.string(),
  })),
  apiKey: z.string().optional(),
  isSecurityScan: z.boolean().optional(),
  userContext: z.string().optional(),
});

export type AiCodeExplanationAndDebuggingInput = z.infer<typeof AiCodeExplanationAndDebuggingInputSchema>;

export const AiCodeExplanationAndDebuggingOutputSchema = z.object({
  explanation: z.string(),
  potentialIssues: z.array(z.string()),
  suggestions: z.array(z.string()),
  summary: z.string(),
  operations: z.array(FileOperationSchema).optional(),
});

export type AiCodeExplanationAndDebuggingOutput = z.infer<typeof AiCodeExplanationAndDebuggingOutputSchema>;

// --- Mission Flow Schemas ---
export const AiMissionInputSchema = z.object({
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

export const AiMissionOutputSchema = z.object({
  analysis: z.string(),
  operations: z.array(FileOperationSchema).optional(),
  summary: z.string(),
});

export type AiMissionOutput = z.infer<typeof AiMissionOutputSchema>;
