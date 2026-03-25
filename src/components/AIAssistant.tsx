'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useFiles } from '@/context/FileContext';
import { useAuth } from '@/context/AuthContext';
import { useFirebase } from '@/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  query,
  Firestore,
  deleteDoc,
} from 'firebase/firestore';
import { 
  Sparkles, 
  Loader2,
  Wand2,
  Lock,
  Layout,
  Bug,
  Zap,
  Plus,
  Building2,
  Key,
  ShieldCheck,
  BrainCircuit,
  MailPlus,
  Package,
  Activity,
  Globe2,
  Trash,
  Trash2,
  Code2,
  ChevronDown,
  ChevronRight,
  UserCog,
  X,
  Check,
  Edit3,
  RotateCcw,
  Shield,
  Folder,
  FileCode,
  FileText,
  FileJson,
  Hash,
  Globe,
  Share2,
  Users,
  UserX,
  Undo2,
  Box,
  Construction,
  SearchCode
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { 
  DesignStrategy,
  LANGUAGES,
} from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';
import { generateCode } from '@/ai/flows/ai-code-generation-flow';
import { aiCodeExplanationAndDebugging, type AiCodeExplanationAndDebuggingOutput } from '@/ai/flows/ai-code-explanation-debugging-flow';
import { processAiMission } from '@/ai/flows/ai-mission-flow';
import { DependencyExplorer } from './DependencyExplorer';
import { type Dependency } from '@/lib/dependency-data';

const SERVERS = [
  { id: 'us-east-1', name: 'US-East (Virginia)', region: 'North America' },
  { id: 'us-west-2', name: 'US-West (Oregon)', region: 'North America' },
  { id: 'us-central-1', name: 'US-Central (Iowa)', region: 'North America' },
  { id: 'eu-west-1', name: 'EU-West (Dublin)', region: 'Europe' },
  { id: 'eu-central-1', name: 'EU-Central (Frankfurt)', region: 'Europe' },
  { id: 'eu-west-2', name: 'Europe-North (London)', region: 'Europe' },
  { id: 'ap-northeast-1', name: 'AP-Northeast (Tokyo)', region: 'Asia' },
  { id: 'ap-southeast-1', name: 'AP-Southeast (Singapore)', region: 'Asia' },
  { id: 'ap-southeast-2', name: 'AP-Southeast (Sydney)', region: 'Oceania' },
  { id: 'ap-south-1', name: 'AP-South (Mumbai)', region: 'Asia' },
  { id: 'sa-east-1', name: 'SA-East (São Paulo)', region: 'South America' },
  { id: 'af-south-1', name: 'AF-South (Cape Town)', region: 'Africa' },
  { id: 'me-south-1', name: 'ME-South (Bahrain)', region: 'Middle East' },
  { id: 'ap-northeast-2', name: 'AP-Northeast (Seoul)', region: 'Asia' },
  { id: 'aq-standard-1', name: 'AQ-Remote (McMurdo)', region: 'Antarctica' }
];

interface ReviewNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children: ReviewNode[];
  opIndex?: number;
}

const getFileIcon = (name: string) => {
  const ext = name.split('.').pop()?.toLowerCase();
  const size = 14;
  switch (ext) {
    case 'ts':
    case 'tsx': return <Code2 size={size} className="text-blue-400" />;
    case 'js':
    case 'jsx': return <FileCode size={size} className="text-yellow-400" />;
    case 'json': return <FileJson size={size} className="text-orange-400" />;
    case 'css': return <Hash size={size} className="text-blue-300" />;
    case 'html': return <Globe size={size} className="text-orange-500" />;
    case 'md': return <FileText size={size} className="text-slate-400" />;
    default: return <FileCode size={size} className="text-muted-foreground" />;
  }
};

const ReviewTreeNode: React.FC<{
  node: ReviewNode;
  depth: number;
  activeOpIndex: number;
  onSelect: (index: number) => void;
  expanded: Record<string, boolean>;
  toggleExpand: (path: string) => void;
  ops: any[];
}> = ({ node, depth, activeOpIndex, onSelect, expanded, toggleExpand, ops }) => {
  const isExpanded = expanded[node.path];
  const isActive = node.opIndex !== undefined && activeOpIndex === node.opIndex;
  const op = node.opIndex !== undefined ? ops[node.opIndex] : null;

  return (
    <div className="select-none">
      <div 
        className={cn(
          "group flex items-center py-1 px-2 cursor-pointer rounded transition-all",
          isActive ? "bg-primary/10 text-primary border border-primary/20" : "hover:bg-white/5"
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={() => {
          if (node.type === 'folder') {
            toggleExpand(node.path);
          } else if (node.opIndex !== undefined) {
            onSelect(node.opIndex);
          }
        }}
      >
        <span className="mr-1.5 opacity-60 shrink-0">
          {node.type === 'folder' ? (
            isExpanded ? <ChevronDown size={12} className="text-primary" /> : <ChevronRight size={12} />
          ) : (
            getFileIcon(node.name)
          )}
        </span>
        
        {node.type === 'folder' ? (
          <Folder size={12} className="mr-1.5 text-muted-foreground/50" />
        ) : null}

        <span className={cn("text-[11px] truncate flex-1 font-medium", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")}>
          {node.name}
        </span>

        {op && (
          <div className={cn(
            "h-1.5 w-1.5 rounded-full shrink-0 ml-2",
            op.type === 'createFile' ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : 
            op.type === 'updateFile' ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" : 
            "bg-destructive"
          )} />
        )}
      </div>
      
      {node.type === 'folder' && isExpanded && node.children.length > 0 && (
        <div className="mt-0.5">
          {node.children.map((child, i) => (
            <ReviewTreeNode 
              key={i} 
              node={child} 
              depth={depth + 1} 
              activeOpIndex={activeOpIndex} 
              onSelect={onSelect} 
              expanded={expanded} 
              toggleExpand={toggleExpand} 
              ops={ops} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const AIAssistant: React.FC = () => {
  const { user } = useAuth();
  const { firestore: db } = useFirebase();
  const { 
    nodes, 
    activeWorkspaceId, 
    workspaces, 
    getNodePath,
    updateNode,
    createNode,
    teams,
    activeTeamId,
    setActiveTeam,
    createTeam,
    deleteTeam,
    kickMember,
    teamMembers,
    isTeamOwner,
    sendTeamInvite,
    selectedServerId,
    setSelectedServer,
    assignWorkspaceToTeam,
    unassignWorkspaceFromTeam
  } = useFiles();
  
  const [activeTab, setActiveTab] = useState('generate');
  const [genPrompt, setGenPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [strategy, setStrategy] = useState<DesignStrategy>('modular');
  const [targetWsId, setTargetWsId] = useState<string>(activeWorkspaceId || '');
  const [selectedLangs, setSelectedLangs] = useState<string[]>([]);
  const [autoSelectDeps, setAutoSelectDeps] = useState(true);

  const [editPrompt, setEditPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const [debugPrompt, setDebugPrompt] = useState('');
  const [debugTargetWs, setDebugTargetWs] = useState<string>(activeWorkspaceId || '');
  const [isDebugging, setIsDebugging] = useState(false);
  const [debugResult, setDebugResult] = useState<AiCodeExplanationAndDebuggingOutput | null>(null);

  const [pendingPatch, setPendingPatch] = useState<any | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [activeReviewIdx, setActiveReviewIdx] = useState(0);
  const [reviewModalAiPrompt, setReviewModalAiPrompt] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [expandedReviewFolders, setExpandedReviewFolders] = useState<Record<string, boolean>>({});

  const [savedKeys, setSavedKeys] = useState<any[]>([]);
  const [activeKeyId, setActiveKeyId] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [newTeamName, setNewTeamName] = useState('');

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignWsId, setAssignWsId] = useState<string>('');

  useEffect(() => {
    if (activeWorkspaceId) {
      setTargetWsId(activeWorkspaceId);
      setDebugTargetWs(activeWorkspaceId);
    }
  }, [activeWorkspaceId]);

  useEffect(() => {
    if (!user?.id || !db) return;
    const keysRef = collection(db as Firestore, `users/${user.id}/keys`);
    const unsubscribe = onSnapshot(query(keysRef), (snapshot) => {
      const keys = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSavedKeys(keys);
    });
    return () => unsubscribe();
  }, [user?.id, db]);

  const getSelectedKey = () => {
    const personal = savedKeys.find(k => k.id === activeKeyId)?.key;
    if (personal) return personal;
    const activeTeam = teams.find(t => t.id === activeTeamId);
    return activeTeam?.teamApiKey || null;
  };

  const isKeyActive = !!getSelectedKey();

  const handleSaveKey = async () => {
    if (!newKeyName.trim() || !newKeyValue.trim() || !db || !user) return;
    const id = uuidv4();
    await setDoc(doc(db as Firestore, `users/${user.id}/keys`, id), { name: newKeyName, key: newKeyValue });
    setNewKeyName(''); setNewKeyValue(''); toast({ title: "Key Saved" });
  };

  const handleDeleteKey = async (e: React.MouseEvent, keyId: string) => {
    e.stopPropagation();
    if (!user?.id || !db) return;
    try {
      await deleteDoc(doc(db as Firestore, `users/${user.id}/keys`, keyId));
      if (activeKeyId === keyId) setActiveKeyId(null);
      toast({ title: "Key Deleted" });
    } catch (err: any) {
      toast({ title: "Delete Failed", description: err.message, variant: "destructive" });
    }
  };

  const findNodeByPath = (path: string, wId: string) => {
    const segments = path.split('/').filter(Boolean);
    if (segments.length === 0) return null;
    let currId: string | null = null;
    for (const segment of segments) {
      const found = Object.values(nodes).find(n => n.workspaceId === wId && n.parentId === currId && n.name === segment);
      if (found) currId = found.id; else return null;
    }
    return currId;
  };

  const handleApplyOperations = async (ops: any[], wsId: string) => {
    if (!ops || ops.length === 0) return;
    const localCreatedFolders: Record<string, string> = {}; 

    const ensureDirectory = async (path: string, wId: string) => {
      const segments = path.split('/').filter(Boolean);
      let currId: string | null = null;
      let pathKey = "";
      for (const segment of segments) {
        pathKey += (pathKey ? "/" : "") + segment;
        const found = Object.values(nodes).find(n => n.workspaceId === wId && n.parentId === currId && n.name === segment);
        if (found) {
          currId = found.id;
        } else if (localCreatedFolders[pathKey]) {
          currId = localCreatedFolders[pathKey];
        } else {
          currId = createNode(currId, segment, 'folder');
          localCreatedFolders[pathKey] = currId;
        }
      }
      return currId;
    };

    for (const op of ops) {
      if (op.type === 'createFile' || op.type === 'updateFile') {
        const segments = op.path.split('/').filter(Boolean);
        const fileName = segments.pop()!;
        const dirPath = segments.join('/');
        const parentId = dirPath ? await ensureDirectory(dirPath, wsId) : null;
        const id = findNodeByPath(op.path, wsId);
        if (id) {
          if (op.content !== undefined) updateNode(id, { content: op.content });
        } else {
          createNode(parentId, fileName, 'file', undefined, op.content);
        }
      } else if (op.type === 'createFolder') {
        await ensureDirectory(op.path, wsId);
      }
    }
  };

  const handleInstallDependency = (pkg: Dependency, wsIds: string[]) => {
    wsIds.forEach(async (wsId) => {
      const pomId = findNodeByPath('pom.xml', wsId);
      const pkgId = findNodeByPath('package.json', wsId);

      if (pomId) {
        const node = nodes[pomId];
        let content = node.content || '';
        const dependencyXml = `\n    <dependency>\n        <groupId>org.springframework.boot</groupId>\n        <artifactId>${pkg.name.toLowerCase().replace(/ /g, '-')}</artifactId>\n    </dependency>`;
        
        if (!content.includes(pkg.name)) {
          if (content.includes('</dependencies>')) {
            content = content.replace('</dependencies>', `${dependencyXml}\n    </dependencies>`);
          } else {
            content = content.replace('</project>', `<dependencies>${dependencyXml}\n    </dependencies>\n</project>`);
          }
          updateNode(pomId, { content });
        }
      } else {
        const pomContent = `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.0</version>
        <relativePath/> 
    </parent>
    <groupId>com.example</groupId>
    <artifactId>demo</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>demo</name>
    <description>Spring Boot Project</description>
    <properties>
        <java.version>17</java.version>
    </properties>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>${pkg.name.toLowerCase().replace(/ /g, '-')}</artifactId>
        </dependency>
    </dependencies>
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>`;
        
        createNode(null, 'pom.xml', 'file', 'xml', pomContent);
        
        const srcId = createNode(null, 'src', 'folder');
        const mainId = createNode(srcId, 'main', 'folder');
        const javaId = createNode(mainId, 'java', 'folder');
        const comId = createNode(javaId, 'com', 'folder');
        const exampleId = createNode(comId, 'example', 'folder');
        const demoId = createNode(exampleId, 'demo', 'folder');
        
        createNode(demoId, 'DemoApplication.java', 'file', 'java', `package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class DemoApplication {
    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }
}`);
      }

      if (pkg.type === 'npm' || pkgId) {
        if (pkgId) {
          const node = nodes[pkgId];
          try {
            const content = JSON.parse(node.content || '{}');
            if (!content.dependencies) content.dependencies = {};
            content.dependencies[pkg.name] = "latest";
            updateNode(pkgId, { content: JSON.stringify(content, null, 2) });
          } catch (e) {
            toast({ title: "Parse Error", description: "Malformed package.json", variant: "destructive" });
          }
        } else if (pkg.type === 'npm') {
          const content = JSON.stringify({
            name: workspaces.find(w => w.id === wsId)?.name || "project",
            version: "1.0.0",
            dependencies: { [pkg.name]: "latest" }
          }, null, 2);
          createNode(null, 'package.json', 'file', 'json', content);
        }
      }
    });
    toast({ title: "Success", description: `${pkg.name} integrated in target workspaces.` });
  };

  const handleGenerate = async () => {
    if (!genPrompt.trim() || !targetWsId || !isKeyActive) return;
    setIsGenerating(true);
    try {
      const result = await generateCode({
        userPrompt: genPrompt, 
        languages: selectedLangs, 
        autoSelectDependencies: autoSelectDeps,
        designStrategy: strategy, 
        complexityLevel: 'medium', 
        apiKey: getSelectedKey()!,
        workspaceContext: Object.values(nodes).filter(n => n.workspaceId === targetWsId).map(n => ({ path: getNodePath(n.id), type: n.type, content: n.content }))
      });
      if (result.operations && result.operations.length > 0) {
        setPendingPatch({ ops: result.operations, wsId: targetWsId, summary: result.generatedCode });
        setActiveReviewIdx(result.operations.findIndex((o: any) => o.type !== 'createFolder') || 0);
        toast({ title: "Ready" });
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "An unexpected error occurred during synthesis.", variant: "destructive" });
    } finally { setIsGenerating(false); }
  };

  const handleDebug = async (isDeepScan: boolean = false) => {
    if (!debugTargetWs || !isKeyActive) return;
    setIsDebugging(true);
    try {
      const files = Object.values(nodes)
        .filter(n => n.workspaceId === debugTargetWs && n.type === 'file')
        .slice(0, isDeepScan ? 30 : 15)
        .map(n => ({ fileName: getNodePath(n.id), fileContent: n.content || '' }));

      const result = await aiCodeExplanationAndDebugging({
        filesToAnalyze: files,
        apiKey: getSelectedKey()!,
        isSecurityScan: isDeepScan,
        userContext: debugPrompt
      });
      
      setDebugResult(result);
      if (result.operations && result.operations.length > 0) {
        setPendingPatch({ ops: result.operations, wsId: debugTargetWs, summary: result.summary });
        setActiveReviewIdx(result.operations.findIndex((o: any) => o.type !== 'createFolder') || 0);
        toast({ title: "Fix Ready" });
      }
    } catch (e: any) {
      toast({ title: "Scan Failed", description: e.message, variant: "destructive" });
    } finally { setIsDebugging(false); }
  };

  const handleEdit = async () => {
    if (!editPrompt.trim() || !targetWsId || !isKeyActive) return;
    setIsEditing(true);
    try {
      const missionDescription = autoSelectDeps 
        ? `${editPrompt}\n\nAUTO-DEPENDENCY DETECTION ENABLED: Identify and add any missing dependencies to package.json or pom.xml.`
        : editPrompt;

      const result = await processAiMission({
        missionTitle: "Workspace Debug",
        missionDescription,
        apiKey: getSelectedKey()!,
        workspaceContext: Object.values(nodes)
          .filter(n => n.workspaceId === targetWsId)
          .map(n => ({ path: getNodePath(n.id), type: n.type, content: n.content }))
      });
      
      if (result.operations && result.operations.length > 0) {
        setPendingPatch({ ops: result.operations, wsId: targetWsId, summary: result.summary });
        setActiveReviewIdx(result.operations.findIndex((o: any) => o.type !== 'createFolder') || 0);
        toast({ title: "Debug Ready" });
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally { setIsEditing(false); }
  };

  const handleRefineReview = async () => {
    const key = getSelectedKey();
    if (!key || !reviewModalAiPrompt.trim() || !pendingPatch) return;
    setIsRefining(true);
    try {
      const currentOp = pendingPatch.ops[activeReviewIdx];
      const result = await processAiMission({
        missionTitle: "Refinement",
        missionDescription: `Refine: ${currentOp.path}. User request: ${reviewModalAiPrompt}`,
        apiKey: key,
        workspaceContext: [{ path: currentOp.path, type: 'file', content: currentOp.content }]
      });

      if (result.operations && result.operations.length > 0) {
        const updatedOps = [...pendingPatch.ops];
        const refinement = result.operations.find((o: any) => o.path === currentOp.path || o.path === currentOp.path.split('/').pop());
        if (refinement && refinement.content) {
          updatedOps[activeReviewIdx] = { ...currentOp, content: refinement.content };
          setPendingPatch({ ...pendingPatch, ops: updatedOps });
          setReviewModalAiPrompt('');
          toast({ title: "Refined" });
        }
      }
    } catch (e: any) {
      toast({ title: "Refinement Failed", variant: "destructive" });
    } finally { setIsRefining(false); }
  };

  const toggleLang = (lang: string) => {
    setSelectedLangs(prev => 
      prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
    );
  };

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return;
    await createTeam(newTeamName.trim());
    setNewTeamName('');
  };

  const handleSendInvite = async () => {
    if (!activeTeamId || !inviteEmail.trim()) return;
    setIsSendingInvite(true);
    try {
      await sendTeamInvite(activeTeamId, inviteEmail);
      setIsInviteModalOpen(false);
      setInviteEmail('');
    } finally { setIsSendingInvite(false); }
  };

  const handleAssignToTeam = async () => {
    if (!assignWsId || !activeTeamId) return;
    await assignWorkspaceToTeam(assignWsId, activeTeamId);
    setIsAssignModalOpen(false);
    setAssignWsId('');
  };

  const handleUnassignFromTeam = async (wsId: string) => {
    if (!activeTeamId) return;
    await unassignWorkspaceFromTeam(wsId, activeTeamId);
  };

  const handleDisbandTeam = async () => {
    if (!activeTeamId) return;
    if (confirm("Delete team and all shared data?")) {
      await deleteTeam(activeTeamId);
    }
  };

  const reviewTree = useMemo(() => {
    if (!pendingPatch) return [];
    const root: ReviewNode[] = [];
    const pathMap: Record<string, ReviewNode> = {};

    pendingPatch.ops.forEach((op: any, index: number) => {
      const parts: string[] = op.path.split('/').filter(Boolean);
      let currentPath = "";
      let parentNodes = root;

      parts.forEach((part: string, i: number) => {
        currentPath += (currentPath ? "/" : "") + part;
        const isLast = i === parts.length - 1;
        if (!pathMap[currentPath]) {
          const newNode: ReviewNode = {
            name: part,
            path: currentPath,
            type: (isLast && op.type !== 'createFolder') ? 'file' : 'folder',
            children: [],
            opIndex: isLast ? index : undefined
          };
          pathMap[currentPath] = newNode;
          parentNodes.push(newNode);
        } else if (isLast) {
          pathMap[currentPath].opIndex = index;
        }
        parentNodes = pathMap[currentPath].children;
      });
    });
    return root;
  }, [pendingPatch]);

  return (
    <div className="flex flex-col h-full w-full bg-sidebar/30 overflow-hidden relative">
      <div className="p-1.5 border-b bg-sidebar/50 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles size={12} className="text-primary" />
            <h2 className="font-bold text-[9px] uppercase tracking-[0.2em] text-foreground/80">AI Assistant</h2>
          </div>
          <Badge variant="outline" className="text-[6px] h-3.5 border-primary/30 bg-primary/10 text-primary uppercase font-black px-1.5">v1.5</Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <div className="px-1.5 py-1 border-b bg-sidebar/30 shrink-0">
          <TabsList className="grid grid-cols-4 h-6 w-full bg-background/50 p-0.5 border border-white/5">
            <TabsTrigger value="generate" className="text-[8px] font-black uppercase tracking-widest">Build</TabsTrigger>
            <TabsTrigger value="edit" className="text-[8px] font-black uppercase tracking-widest">Debug</TabsTrigger>
            <TabsTrigger value="debug" className="text-[8px] font-black uppercase tracking-widest">Audit</TabsTrigger>
            <TabsTrigger value="settings" className="text-[8px] font-black uppercase tracking-widest">Configs</TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1 overflow-x-hidden">
          <div className="p-2 space-y-3">
            <TabsContent value="generate" className="mt-0 space-y-3 relative min-h-[400px]">
              {!isKeyActive && (
                <div className="absolute inset-0 z-[60] bg-background/60 backdrop-blur-[2px] flex flex-col items-center justify-center rounded-md border border-white/5 p-6 text-center">
                   <Lock size={32} className="text-primary animate-pulse opacity-50 mb-4" />
                   <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Build Locked</p>
                   <p className="text-[8px] text-muted-foreground uppercase leading-relaxed max-w-[180px]">Add an API Key in the <span className="text-primary">Configs</span> tab to enable AI builds.</p>
                </div>
              )}
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[7px] font-black uppercase text-primary tracking-[0.2em] flex items-center gap-1.5"><Layout size={10} /> Workspace</label>
                  <Select value={targetWsId} onValueChange={setTargetWsId} disabled={isGenerating}>
                    <SelectTrigger className="h-7 text-[9px] bg-background/50 border-border px-2">
                      <SelectValue placeholder="Select workspace..." />
                    </SelectTrigger>
                    <SelectContent>
                      {workspaces.map(ws => <SelectItem key={ws.id} value={ws.id} className="text-[9px]">{ws.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Separator className="bg-border/30" />
                <Textarea 
                  value={genPrompt} 
                  onChange={(e) => setGenPrompt(e.target.value)} 
                  placeholder="Describe what you want to build..." 
                  className="min-h-[120px] text-[11px] bg-background/50 border-border p-2" 
                  disabled={isGenerating}
                />
                
                <div className="space-y-1.5">
                  <label className="text-[7px] font-black uppercase text-muted-foreground tracking-widest flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><Code2 size={10} /> Language Selector</span>
                    <span className="text-primary">{selectedLangs.length === 0 ? "Auto" : `${selectedLangs.length} Selected`}</span>
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full h-7 text-[9px] bg-background/50 border-border justify-between px-2" disabled={isGenerating}>
                        <span className="truncate">
                          {selectedLangs.length === 0 ? "Auto" : `${selectedLangs.length} Selected`}
                        </span>
                        <ChevronDown size={10} className="opacity-50 shrink-0 ml-2" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[240px] p-0 bg-sidebar border-border shadow-2xl" align="start">
                      <div className="p-2 border-b bg-background/50 flex items-center justify-between">
                        <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Select Languages</span>
                        <Button variant="ghost" size="sm" className="h-5 text-[7px] font-black uppercase px-1.5" onClick={() => setSelectedLangs([])}>Clear</Button>
                      </div>
                      <ScrollArea className="h-[280px]">
                        <div className="p-1 grid grid-cols-1 gap-0.5">
                          {LANGUAGES.map(lang => (
                            <div 
                              key={lang} 
                              className={cn(
                                "flex items-center gap-2 p-1.5 rounded cursor-pointer transition-colors",
                                selectedLangs.includes(lang) ? "bg-primary/10" : "hover:bg-white/5"
                              )}
                              onClick={() => toggleLang(lang)}
                            >
                              <Checkbox checked={selectedLangs.includes(lang)} className="h-3 w-3" />
                              <span className={cn("text-[10px] capitalize", selectedLangs.includes(lang) ? "text-primary font-bold" : "text-muted-foreground")}>
                                {lang}
                              </span>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-primary/5 border border-primary/10">
                  <div className="flex flex-col gap-0.5">
                    <label className="text-[7px] font-black uppercase text-primary tracking-widest">Auto Dependencies</label>
                    <span className="text-[6px] text-muted-foreground uppercase">AI will add required packages.</span>
                  </div>
                  <Switch checked={autoSelectDeps} onCheckedChange={setAutoSelectDeps} className="scale-75 origin-right" disabled={isGenerating} />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[7px] font-black uppercase text-muted-foreground tracking-widest">Strategy</label>
                  <div className="grid grid-cols-3 gap-1">
                    {(['single-file', 'modular', 'highly-decoupled'] as DesignStrategy[]).map(s => (
                      <Button key={s} variant={strategy === s ? 'default' : 'outline'} size="sm" className="h-6 text-[7px] uppercase font-black" onClick={() => setStrategy(s)} disabled={isGenerating}>{s.split('-')[0]}</Button>
                    ))}
                  </div>
                </div>
                <Button className="w-full h-8 font-black uppercase tracking-[0.2em] text-[9px] gap-2" onClick={handleGenerate} disabled={isGenerating || !genPrompt.trim() || !isKeyActive}>
                  {isGenerating ? <Loader2 size={12} className="animate-spin" /> : <Construction size={12} />} {isGenerating ? "Building..." : "Build"}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="edit" className="mt-0 space-y-3 relative min-h-[400px]">
              {!isKeyActive && (
                <div className="absolute inset-0 z-[60] bg-background/60 backdrop-blur-[2px] flex flex-col items-center justify-center rounded-md border border-white/5">
                   <Lock size={32} className="text-primary animate-pulse opacity-50" />
                </div>
              )}
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[7px] font-black uppercase text-primary tracking-[0.2em] flex items-center gap-1.5"><Bug size={10} /> Workspace</label>
                  <Select value={targetWsId} onValueChange={setTargetWsId} disabled={isEditing}>
                    <SelectTrigger className="h-7 text-[9px] bg-background/50 border-border px-2">
                      <SelectValue placeholder="Select workspace..." />
                    </SelectTrigger>
                    <SelectContent>
                      {workspaces.map(ws => <SelectItem key={ws.id} value={ws.id} className="text-[9px]">{ws.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Textarea 
                  value={editPrompt} 
                  onChange={(e) => setEditPrompt(e.target.value)} 
                  placeholder="Describe issues to debug..." 
                  className="min-h-[120px] text-[11px] bg-background/50 p-2" 
                  disabled={isEditing}
                />
                
                <div className="flex items-center justify-between p-2 rounded bg-primary/5 border border-primary/10">
                  <div className="flex flex-col gap-0.5">
                    <label className="text-[7px] font-black uppercase text-primary tracking-widest">Auto Dependencies</label>
                    <span className="text-[6px] text-muted-foreground uppercase">AI will update configs.</span>
                  </div>
                  <Switch checked={autoSelectDeps} onCheckedChange={setAutoSelectDeps} className="scale-75 origin-right" disabled={isEditing} />
                </div>

                <Button className="w-full h-8 font-black uppercase tracking-[0.2em] text-[9px] gap-2" onClick={handleEdit} disabled={isEditing || !editPrompt.trim() || !isKeyActive}>
                  {isEditing ? <Loader2 size={12} className="animate-spin" /> : <RotateCcw size={12} />} {isEditing ? "Debugging..." : "Debug"}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="debug" className="mt-0 space-y-3 relative min-h-[400px]">
              {!isKeyActive && (
                <div className="absolute inset-0 z-[60] bg-background/60 backdrop-blur-[2px] flex flex-col items-center justify-center rounded-md border border-white/5">
                   <Lock size={32} className="text-primary animate-pulse opacity-50" />
                </div>
              )}
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[7px] font-black uppercase text-primary tracking-[0.2em] flex items-center gap-1.5"><SearchCode size={10} /> Audit Hub</label>
                  <Select value={debugTargetWs} onValueChange={setDebugTargetWs} disabled={isDebugging}>
                    <SelectTrigger className="h-7 text-[9px] bg-background/50 border-border px-2">
                      <SelectValue placeholder="Select workspace..." />
                    </SelectTrigger>
                    <SelectContent>
                      {workspaces.map(ws => <SelectItem key={ws.id} value={ws.id} className="text-[9px]">{ws.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Textarea 
                    value={debugPrompt} 
                    onChange={(e) => setDebugPrompt(e.target.value)} 
                    placeholder="Describe specific area to audit..." 
                    className="min-h-[60px] text-[11px] bg-background/50 p-2" 
                    disabled={isDebugging}
                  />
                  <div className="grid grid-cols-2 gap-1.5">
                    <Button variant="secondary" className="h-8 font-black uppercase tracking-widest text-[9px] gap-1.5" onClick={() => handleDebug(false)} disabled={isDebugging || !isKeyActive}>
                      {isDebugging ? <Loader2 size={12} className="animate-spin" /> : <Activity size={12} />} Audit
                    </Button>
                    <Button variant="outline" className="h-8 font-black uppercase tracking-widest text-[9px] border-primary/30 gap-1.5" onClick={() => handleDebug(true)} disabled={isDebugging || !isKeyActive}>
                      <Shield size={12} className="text-primary" /> Security
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="settings" className="mt-0 space-y-4 pb-10">
              <div className="p-2.5 rounded border border-white/5 bg-sidebar/40 space-y-3 shadow-xl">
                <label className="text-[8px] font-black uppercase text-primary tracking-[0.2em] flex items-center gap-1.5"><Key size={10} /> API Keys</label>
                <div className="space-y-2">
                  <Input placeholder="Key Name" value={newKeyName} onChange={e => setNewKeyName(e.target.value)} className="h-7 text-[9px] bg-background/30 border-white/5" />
                  <Input type="password" placeholder="Key Value" value={newKeyValue} onChange={e => setNewKeyValue(e.target.value)} className="h-7 text-[9px] bg-background/30 border-white/5" />
                  <Button variant="outline" className="w-full h-7 text-[8px] font-black uppercase border-primary/20 hover:bg-primary/10" onClick={handleSaveKey}>Save Key</Button>
                </div>
                {savedKeys.length > 0 && (
                  <div className="space-y-1 mt-2">
                    {savedKeys.map(k => (
                      <div key={k.id} onClick={() => setActiveKeyId(k.id)} className={cn("group flex items-center justify-between p-1.5 rounded cursor-pointer transition-all", activeKeyId === k.id ? "bg-primary/20 border border-primary/30" : "bg-background/20 hover:bg-white/5")}>
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className="text-[9px] font-bold truncate">{k.name}</span>
                          {activeKeyId === k.id && <ShieldCheck size={10} className="text-primary shrink-0" />}
                        </div>
                        <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => handleDeleteKey(e, k.id)}>
                          <Trash size={10} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-2.5 rounded border border-white/5 bg-sidebar/40 space-y-3 shadow-xl">
                <label className="text-[8px] font-black uppercase text-primary tracking-[0.2em] flex items-center gap-1.5"><Package size={10} /> Dependencies</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full h-8 text-[8px] font-black uppercase border-primary/30 bg-primary/5 hover:bg-primary/10 gap-2">
                      <Box size={12} /> Manage Modules
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0 bg-sidebar border-border shadow-2xl" side="left" align="start">
                    <div className="p-3 border-b bg-background/50">
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary">Workspace Packages</span>
                    </div>
                    <DependencyExplorer workspaces={workspaces} onInstallRequest={handleInstallDependency} />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="p-2.5 rounded border border-white/5 bg-sidebar/40 space-y-3 shadow-xl">
                <label className="text-[8px] font-black uppercase text-primary tracking-[0.2em] flex items-center gap-1.5"><Globe2 size={10} /> Server</label>
                <Select value={selectedServerId} onValueChange={setSelectedServer}>
                  <SelectTrigger className="h-7 text-[9px] bg-background/30 border-white/5">
                    <SelectValue placeholder="Select Server..." />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVERS.map(s => (
                      <SelectItem key={s.id} value={s.id} className="text-[9px]">
                        <div className="flex flex-col">
                          <span className="font-bold">{s.name}</span>
                          <span className="text-[7px] opacity-50 uppercase">{s.region}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="p-2.5 rounded border border-white/5 bg-sidebar/40 space-y-3 shadow-xl">
                <div className="flex items-center justify-between">
                  <label className="text-[8px] font-black uppercase text-primary tracking-[0.2em] flex items-center gap-1.5"><Building2 size={10} /> Teams</label>
                  <Badge variant="secondary" className="text-[6px] h-4 px-2 bg-primary/20 text-primary">Admin</Badge>
                </div>

                <div className="space-y-4">
                  {user && !user.isAnonymous ? (
                    <>
                      <div className="p-2 rounded bg-background/20 border border-white/5 space-y-2">
                        <Input placeholder="Team Name..." value={newTeamName} onChange={e => setNewTeamName(e.target.value)} className="h-7 text-[9px] bg-background/30" />
                        <Button className="w-full h-7 text-[8px] font-black uppercase" onClick={handleCreateTeam}>Create Team</Button>
                      </div>

                      {teams.length > 0 && (
                        <div className="space-y-3">
                          <Select value={activeTeamId || ''} onValueChange={setActiveTeam}>
                            <SelectTrigger className="h-7 text-[9px] bg-background/30 border-white/5">
                              <SelectValue placeholder="Switch team..." />
                            </SelectTrigger>
                            <SelectContent>
                              {teams.map(team => <SelectItem key={team.id} value={team.id} className="text-[9px] font-bold">{team.name}</SelectItem>)}
                            </SelectContent>
                          </Select>

                          {activeTeamId && (
                            <div className="p-2 rounded bg-primary/5 border border-primary/20 space-y-3">
                              <div className="flex items-center justify-between">
                                <label className="text-[7px] font-black uppercase text-primary tracking-widest flex items-center gap-1.5">
                                  <Users size={10} /> {teamMembers.length} Members
                                </label>
                                {isTeamOwner && (
                                  <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-primary" onClick={() => setIsInviteModalOpen(true)}>
                                    <MailPlus size={12} />
                                  </Button>
                                )}
                              </div>

                              <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                                {teamMembers.map(member => (
                                  <div key={member.userId} className="flex items-center justify-between p-1.5 rounded bg-background/30 border border-white/5">
                                    <div className="flex flex-col min-w-0">
                                      <span className="text-[9px] font-bold truncate">{member.username}</span>
                                      <span className="text-[7px] text-muted-foreground truncate">{member.email}</span>
                                    </div>
                                    {isTeamOwner && member.userId !== user?.id && (
                                      <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-destructive" onClick={() => kickMember(activeTeamId, member.userId)}>
                                        <UserX size={10} />
                                      </Button>
                                    )}
                                  </div>
                                ))}
                              </div>

                              <div className="grid grid-cols-1 gap-1.5">
                                {isTeamOwner && (
                                  <>
                                    <Button variant="outline" className="h-7 text-[8px] font-black uppercase gap-1.5 border-primary/30 bg-primary/10 hover:bg-primary/20" onClick={() => setIsAssignModalOpen(true)}>
                                      <Share2 size={10} /> Assign Workspace
                                    </Button>
                                    <Button variant="outline" className="h-7 text-[8px] font-black uppercase gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10" onClick={handleDisbandTeam}>
                                      <Trash2 size={10} /> Delete Team
                                    </Button>
                                  </>
                                )}
                              </div>

                              {isTeamOwner && workspaces.filter(w => w.teamId === activeTeamId).length > 0 && (
                                <div className="space-y-1.5 pt-2 border-t border-primary/10">
                                  <p className="text-[7px] font-black uppercase text-muted-foreground tracking-widest px-1">Managed Workspaces</p>
                                  <div className="space-y-1 max-h-32 overflow-y-auto">
                                    {workspaces.filter(w => w.teamId === activeTeamId).map(ws => (
                                      <div key={ws.id} className="flex items-center justify-between p-1.5 rounded bg-background/20 border border-white/5">
                                        <span className="text-[9px] font-bold truncate flex-1 mr-2">{ws.name}</span>
                                        <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-primary" onClick={() => handleUnassignFromTeam(ws.id)} title="Unassign from team">
                                          <Undo2 size={10} />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-4 bg-background/20 rounded border border-dashed border-white/10">
                      <p className="text-[8px] text-muted-foreground uppercase font-black tracking-widest">Login Required</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </div>
        </ScrollArea>

        {pendingPatch && (
          <div className="p-3 bg-primary/10 border-t border-primary/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Check size={14} className="text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest">Review Changes</span>
              </div>
              <Badge variant="outline" className="text-[7px] h-4 bg-primary/5 border-primary/20 text-primary">
                {pendingPatch.ops.length} Files
              </Badge>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <Button size="sm" className="h-7 text-[8px] font-black uppercase bg-primary" onClick={() => {
                handleApplyOperations(pendingPatch.ops, pendingPatch.wsId);
                setPendingPatch(null);
                toast({ title: "Changes Applied" });
              }}>Accept</Button>
              <Button variant="outline" size="sm" className="h-7 text-[8px] font-black uppercase" onClick={() => setIsReviewOpen(true)}>Review</Button>
              <Button variant="ghost" size="sm" className="h-7 text-[8px] font-black uppercase text-destructive" onClick={() => setPendingPatch(null)}>Cancel</Button>
            </div>
          </div>
        )}

        <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
          <DialogContent className="max-w-[90vw] w-[1000px] h-[85vh] p-0 bg-sidebar flex flex-col border-border">
            <DialogHeader className="p-4 border-b shrink-0 flex flex-row items-center justify-between space-y-0">
              <DialogTitle className="text-xs font-black uppercase tracking-[0.2em] text-primary">Review Build</DialogTitle>
              <DialogDescription className="text-[10px] text-muted-foreground uppercase">Review and refine the generated code before applying it to your workspace.</DialogDescription>
              <Button variant="outline" size="sm" className="h-8 text-[9px] font-black uppercase gap-2" onClick={() => {
                if (pendingPatch) handleApplyOperations(pendingPatch.ops, pendingPatch.wsId);
                setPendingPatch(null);
                setIsReviewOpen(false);
                toast({ title: "Build Merged" });
              }}>
                <Check size={14} className="text-primary" /> Accept All
              </Button>
            </DialogHeader>

            <div className="flex-1 flex overflow-hidden">
              <div className="w-64 border-r bg-background/20 shrink-0 flex flex-col">
                <div className="p-3 border-b flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase text-muted-foreground">Assets</span>
                </div>
                <ScrollArea className="flex-1">
                  <div className="p-1.5 space-y-0.5">
                    {reviewTree.map((node, i) => (
                      <ReviewTreeNode 
                        key={i} 
                        node={node} 
                        depth={0} 
                        activeOpIndex={activeReviewIdx} 
                        onSelect={setActiveReviewIdx} 
                        expanded={expandedReviewFolders} 
                        toggleExpand={(path: string) => setExpandedReviewFolders(prev => ({ ...prev, [path]: !prev[path] }))}
                        ops={pendingPatch?.ops || []}
                      />
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <div className="flex-1 flex flex-col overflow-hidden">
                <Tabs defaultValue="new" className="flex-1 flex flex-col overflow-hidden">
                  <div className="px-4 py-2 border-b flex items-center justify-between shrink-0">
                    <TabsList className="h-7 bg-background/50 p-0.5">
                      <TabsTrigger value="old" className="text-[9px] font-black uppercase">Old</TabsTrigger>
                      <TabsTrigger value="new" className="text-[9px] font-black uppercase text-primary">New</TabsTrigger>
                    </TabsList>
                    <Badge variant="outline" className="text-[8px] font-mono h-5">
                      {pendingPatch?.ops[activeReviewIdx]?.path}
                    </Badge>
                  </div>

                  <div className="flex-1 relative overflow-hidden">
                    <TabsContent value="old" className="absolute inset-0 m-0 h-full">
                      <ScrollArea className="h-full bg-[#0B0D0F]">
                        <div className="p-4 font-code text-[12px] leading-relaxed whitespace-pre opacity-70">
                          {(() => {
                            const op = pendingPatch?.ops[activeReviewIdx];
                            if (!op || op.type === 'createFolder') return <div className="text-center py-20 text-[10px] font-black uppercase opacity-20">No changes</div>;
                            const node = Object.values(nodes).find(n => getNodePath(n.id) === op.path);
                            const oldContent = node?.content || '(New File)';
                            return oldContent.split('\n').map((line, i) => (
                              <div key={i} className="flex gap-4 px-2">
                                <span className="w-8 shrink-0 text-right opacity-30 select-none">{i + 1}</span>
                                <span>{line}</span>
                              </div>
                            ));
                          })()}
                        </div>
                      </ScrollArea>
                    </TabsContent>

                    <TabsContent value="new" className="absolute inset-0 m-0 h-full flex flex-col">
                      <Textarea 
                        value={pendingPatch?.ops[activeReviewIdx]?.content || ''}
                        onChange={(e) => {
                          if (pendingPatch) {
                            const updatedOps = [...pendingPatch.ops];
                            updatedOps[activeReviewIdx] = { ...updatedOps[activeReviewIdx], content: e.target.value };
                            setPendingPatch({ ...pendingPatch, ops: updatedOps });
                          }
                        }}
                        className="flex-1 p-4 font-code text-[12px] bg-[#0B0D0F] border-none focus-visible:ring-0 resize-none text-foreground"
                        spellCheck={false}
                      />
                    </TabsContent>
                  </div>
                </Tabs>
                
                <div className="p-3 border-t bg-sidebar/50 flex gap-2 shrink-0">
                  <Input 
                    value={reviewModalAiPrompt} 
                    onChange={(e) => setReviewModalAiPrompt(e.target.value)} 
                    placeholder="Refine build..." 
                    className="h-9 text-[11px] bg-background/50 border-white/10" 
                    onKeyDown={(e) => e.key === 'Enter' && handleRefineReview()} 
                  />
                  <Button className="h-9 gap-2 px-4 text-[10px] font-black uppercase shadow-lg shadow-primary/20" onClick={handleRefineReview} disabled={isRefining || !reviewModalAiPrompt.trim()}>
                    {isRefining ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />} Refine
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
          <DialogContent className="bg-sidebar border-border p-5 max-w-[340px]">
            <DialogHeader>
              <DialogTitle className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">Invite Developer</DialogTitle>
              <DialogDescription className="text-[10px] text-muted-foreground uppercase leading-relaxed">Send an invitation to another developer to join this team.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <Input type="email" placeholder="name@example.com" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} className="h-9 text-[11px]" />
              <Button className="w-full h-9 text-[10px] font-black uppercase" onClick={handleSendInvite} disabled={isSendingInvite || !inviteEmail.trim()}>Send Invite</Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
          <DialogContent className="bg-sidebar border-border p-5 max-w-[340px]">
            <DialogHeader>
              <DialogTitle className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">Assign Workspace</DialogTitle>
              <DialogDescription className="text-[10px] text-muted-foreground uppercase leading-relaxed">Route a private workspace into the team to enable collaboration.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <Select value={assignWsId} onValueChange={setAssignWsId}>
                <SelectTrigger className="h-9 text-[11px] bg-background/50"><SelectValue placeholder="Select workspace..." /></SelectTrigger>
                <SelectContent>{workspaces.filter(w => !w.teamId).map(ws => <SelectItem key={ws.id} value={ws.id} className="text-[11px] font-bold">{ws.name}</SelectItem>)}</SelectContent>
              </Select>
              <Button className="w-full h-9 text-[10px] font-black uppercase bg-primary" onClick={handleAssignToTeam} disabled={!assignWsId}>Assign to Team</Button>
            </div>
          </DialogContent>
        </Dialog>
      </Tabs>
    </div>
  );
};
