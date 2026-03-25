
export type FileType = 'file' | 'folder';

export interface FileNode {
  id: string;
  name: string;
  type: FileType;
  content?: string;
  language?: string;
  parentId: string | null;
  children?: string[];
  workspaceId: string;
  teamId?: string; // Added for efficient security rule validation
  ownerId: string;
  updatedAt?: any;
}

export interface WorkspaceContributor {
  userId: string;
  email?: string;
}

export interface Workspace {
  id: string;
  name: string;
  userId: string;
  teamId?: string;
  collaboratorIds: string[];
  collaborators: WorkspaceContributor[];
  rootFileIds: string[];
  createdAt: number;
}

export interface UserSession {
  id: string;
  email: string;
  username: string;
  photoURL?: string | null;
  isAnonymous: boolean;
}

export interface Team {
  id: string;
  name: string;
  ownerId: string;
  teamApiKey?: string;
  createdAt: number;
}

export interface Member {
  userId: string;
  username: string;
  email: string;
  joinedAt: number;
}

export interface TeamInvite {
  id: string;
  teamId: string;
  teamName: string;
  senderId: string;
  senderName: string;
  createdAt: number;
}

export interface AiMission {
  id: string;
  title: string;
  description: string;
  type: 'debug' | 'generation';
  trigger: 'interval' | 'on-generation' | 'on-server-switch' | 'manual';
  intervalMinutes?: number;
  lastRun?: number;
  isActive: boolean;
  workspaceId: string;
}

export const LANGUAGES = [
  'javascript', 'typescript', 'python', 'java', 'cpp', 'csharp', 'go', 'rust',
  'ruby', 'php', 'swift', 'kotlin', 'dart', 'html', 'css', 'sql', 'shell',
  'json', 'yaml', 'markdown', 'c', 'lua', 'r', 'elixir', 'clojure', 'haskell',
  'perl', 'objective-c', 'scala', 'assembly', 'solidity', 'zig', 'v', 'julia',
  'matlab', 'fortran', 'cobol', 'lisp', 'prolog', 'pascal', 'ada', 'erlang',
  'fsharp', 'ocaml', 'groovy', 'powershell', 'batch', 'dockerfile', 'makefile',
  'latex', 'graphql', 'wasm', 'terraform', 'toml', 'xml'
];

export const EXT_TO_LANG: Record<string, string> = {
  ts: 'typescript',
  tsx: 'typescript',
  js: 'javascript',
  jsx: 'javascript',
  py: 'python',
  java: 'java',
  cpp: 'cpp',
  cs: 'csharp',
  go: 'go',
  rs: 'rust',
  rb: 'ruby',
  php: 'php',
  swift: 'swift',
  kt: 'kotlin',
  dart: 'dart',
  html: 'html',
  css: 'css',
  sql: 'sql',
  sh: 'shell',
  json: 'json',
  yml: 'yaml',
  yaml: 'yaml',
  md: 'markdown',
  c: 'c',
  lua: 'lua',
  r: 'r',
  ex: 'elixir',
  exs: 'elixir',
  clj: 'clojure',
  hs: 'haskell',
  pl: 'perl',
  m: 'objective-c',
  scala: 'scala',
  sol: 'solidity',
  zig: 'zig',
  v: 'v',
  jl: 'julia',
  f: 'fortran',
  f90: 'fortran',
  pas: 'pascal',
  erl: 'erlang',
  fs: 'fsharp',
  ml: 'ocaml',
  groovy: 'groovy',
  ps1: 'powershell',
  bat: 'batch',
  dockerfile: 'dockerfile',
  makefile: 'makefile',
  tex: 'latex',
  graphql: 'graphql',
  tf: 'terraform',
  toml: 'toml',
  xml: 'xml'
};

export const LANG_TO_EXT: Record<string, string> = Object.fromEntries(
  Object.entries(EXT_TO_LANG).map(([ext, lang]) => [lang, ext])
);

export function getLanguageFromFileName(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase();
  if (!ext) return 'typescript';
  return EXT_TO_LANG[ext] || 'typescript';
}

export type DesignStrategy = 'single-file' | 'modular' | 'highly-decoupled';

export interface ComplexityLevel {
  id: 'simple' | 'medium' | 'complex';
  label: string;
}

export const COMPLEXITY_LEVELS: ComplexityLevel[] = [
  { id: 'simple', label: 'Simple' },
  { id: 'medium', label: 'Medium' },
  { id: 'complex', label: 'Complex' }
];

export const DESIGN_STRATEGIES = [
  { id: 'single-file', label: 'Single File (Script)' },
  { id: 'modular', label: 'Modular (2-3 Folders)' },
  { id: 'highly-decoupled', label: 'Enterprise (Many Folders)' }
];
