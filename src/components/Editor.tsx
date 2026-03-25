'use client';

import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { useFiles } from '@/context/FileContext';
import { 
  FileCode, Save, X, ChevronRight, Hash, Code, 
  FileJson, FileText, Globe, FileBox, Layers,
  Activity, Zap, Globe2, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { LANGUAGES, LANG_TO_EXT, getLanguageFromFileName } from '@/lib/types';
import { cn } from '@/lib/utils';

const getFileIcon = (name: string) => {
  const ext = name.split('.').pop()?.toLowerCase();
  const size = 14;
  switch (ext) {
    case 'ts':
    case 'tsx': return <Code size={size} className="text-blue-400" />;
    case 'js':
    case 'jsx': return <FileCode size={size} className="text-yellow-400" />;
    case 'json': return <FileJson size={size} className="text-orange-400" />;
    case 'css': return <Hash size={size} className="text-blue-300" />;
    case 'html': return <Globe size={size} className="text-orange-500" />;
    case 'md': return <FileText size={size} className="text-slate-400" />;
    default: return <FileBox size={size} className="text-muted-foreground" />;
  }
};

export const Editor: React.FC = () => {
  const { 
    activeFileId, openFileIds, nodes, updateNode, 
    setActiveFile, closeFile, getNodePath, selectedServerId 
  } = useFiles();
  
  const activeFile = activeFileId ? nodes[activeFileId] : null;
  
  const [localContent, setLocalContent] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [latency, setLatency] = useState('0ms');
  const lastSyncedId = useRef<string | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (activeFileId !== lastSyncedId.current) {
      setLocalContent(activeFile?.content || '');
      setIsDirty(false);
      lastSyncedId.current = activeFileId;
    }
  }, [activeFileId, activeFile?.content]);

  useEffect(() => {
    if (isDirty) {
      startTimeRef.current = performance.now();
    } else if (startTimeRef.current > 0) {
      const end = performance.now();
      const diff = Math.round(end - startTimeRef.current);
      setLatency(`${diff}ms`);
      startTimeRef.current = 0;
    }
  }, [isDirty]);

  const handleContentChange = useCallback((newContent: string) => {
    setLocalContent(newContent);
    setIsDirty(true);
    if (activeFileId) {
      updateNode(activeFileId, { content: newContent });
    }
  }, [activeFileId, updateNode]);

  const handleLanguageChange = (newLang: string) => {
    if (!activeFileId || !activeFile) return;
    const currentName = activeFile.name;
    const baseName = currentName.includes('.') ? currentName.split('.').slice(0, -1).join('.') : currentName;
    const newExt = LANG_TO_EXT[newLang] || 'txt';
    const newName = `${baseName}.${newExt}`;
    updateNode(activeFileId, { language: newLang, name: newName });
  };

  const breadcrumbs = useMemo(() => {
    if (!activeFileId) return [];
    return getNodePath(activeFileId).split(' / ');
  }, [activeFileId, getNodePath]);

  if (!activeFile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground bg-background">
        <Layers size={48} className="mb-4 opacity-10" />
        <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-30">IDE Ready</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background h-full overflow-hidden">
      <div className="h-9 flex items-center bg-sidebar/50 border-b overflow-x-auto no-scrollbar shrink-0 pr-10">
        {openFileIds.map(id => {
          const node = nodes[id];
          if (!node) return null;
          const isActive = activeFileId === id;
          return (
            <div 
              key={id}
              onClick={() => setActiveFile(id)}
              className={cn(
                "group flex items-center h-full px-3 border-r cursor-pointer transition-colors shrink-0",
                isActive ? "bg-background border-t-2 border-t-primary" : "bg-sidebar/20 hover:bg-sidebar/40"
              )}
            >
              <span className="mr-2 shrink-0">{getFileIcon(node.name)}</span>
              <span className={cn("text-[11px] font-medium truncate max-w-[120px]", isActive ? "text-foreground" : "text-muted-foreground")}>
                {node.name}
              </span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-4 w-4 ml-2 opacity-0 group-hover:opacity-100 hover:bg-secondary"
                onClick={(e) => { e.stopPropagation(); closeFile(id); }}
              >
                <X size={10} />
              </Button>
            </div>
          );
        })}
      </div>

      <div className="h-8 border-b flex items-center px-4 bg-sidebar/10 shrink-0 overflow-hidden whitespace-nowrap">
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium uppercase tracking-wider overflow-hidden">
          {breadcrumbs.map((crumb, i) => (
            <React.Fragment key={i}>
              <span className={cn(i === breadcrumbs.length - 1 && "text-primary/80")}>{crumb}</span>
              {i < breadcrumbs.length - 1 && <ChevronRight size={10} className="mx-0.5 opacity-40" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="h-10 border-b flex items-center px-4 justify-between bg-sidebar/20 shrink-0">
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-[9px] h-4 uppercase font-bold bg-primary/5 text-primary border-primary/20">
            {activeFile.language}
          </Badge>
          <span className="text-[10px] text-muted-foreground font-mono">
            {isDirty ? 'Pending...' : `Synced: ${activeFile.updatedAt ? new Date(activeFile.updatedAt).toLocaleTimeString() : 'Saving...'}`}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Select 
            value={activeFile.language} 
            onValueChange={handleLanguageChange}
          >
            <SelectTrigger className="h-6 text-[10px] w-24 bg-background/50 border-none ring-1 ring-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map(lang => (
                <SelectItem key={lang} value={lang} className="text-[10px]">{lang}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn("h-7 w-7 transition-colors", isDirty ? "text-primary animate-pulse" : "text-muted-foreground")}
            onClick={() => {
              if (activeFileId) updateNode(activeFileId, { content: localContent });
            }}
          >
            <Save size={14} />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-10 border-r bg-sidebar/5 flex flex-col items-center py-4 text-muted-foreground/30 text-[9px] font-mono select-none shrink-0">
          {Array.from({ length: 50 }).map((_, i) => (
            <div key={i} className="h-5 flex items-center">{i + 1}</div>
          ))}
        </div>
        <div className="flex-1 h-full">
          <Textarea 
            className="w-full h-full p-4 font-code text-[13px] bg-transparent border-none focus-visible:ring-0 resize-none leading-relaxed selection:bg-primary/20"
            value={localContent}
            onChange={(e) => handleContentChange(e.target.value)}
            spellCheck={false}
          />
        </div>
      </div>

      <div className="h-6 border-t px-4 flex items-center justify-between bg-sidebar/50 text-[9px] text-muted-foreground/50 font-bold uppercase tracking-[0.15em]">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5"><Globe2 size={10} className="text-primary" /> Server: {selectedServerId.toUpperCase()}</span>
          <span>{localContent.length} Chars</span>
          <span className="hidden sm:inline">© 2026 Frostvale Studio</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Activity size={10} className="text-primary" />
            <span className="text-primary">{latency} Latency</span>
          </div>
          <span className="text-accent flex items-center gap-1"><Shield size={10} className="text-accent" /> Proprietary</span>
        </div>
      </div>
    </div>
  );
};