'use client';

import React, { useState, useCallback } from 'react';
import { useFiles } from '@/context/FileContext';
import { useAuth } from '@/context/AuthContext';
import { 
  Plus, ChevronRight, ChevronDown, FileCode, Folder, Trash, FolderPlus,
  FilePlus, Layers, Download, Edit2, MoreHorizontal,
  LogOut, Search, Code, FileJson, FileText,
  FileBox, Globe, Hash, X, LayoutGrid,
  FileUp, Zap, Check, ArrowUpCircle, Shield,
  Building2, Users, UserX, Undo2, Copyright,
  Scale
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LicenseDialog } from './LicenseDialog';

const getFileIcon = (name: string, isActive: boolean) => {
  const ext = name.split('.').pop()?.toLowerCase();
  const className = isActive ? "text-primary" : "text-muted-foreground/60";
  const size = 14;

  switch (ext) {
    case 'ts':
    case 'tsx': return <Code size={size} className={cn(className, "text-blue-400")} />;
    case 'js':
    case 'jsx': return <FileCode size={size} className={cn(className, "text-yellow-400")} />;
    case 'json': return <FileJson size={size} className={cn(className, "text-orange-400")} />;
    case 'css': return <Hash size={size} className={cn(className, "text-blue-300")} />;
    case 'html': return <Globe size={size} className={cn(className, "text-orange-500")} />;
    case 'md': return <FileText size={size} className={cn(className, "text-slate-400")} />;
    default: return <FileBox size={size} className={className} />;
  }
};

const FileTreeNode = React.memo(({ 
  nodeId, depth, nodes, activeFileId, expandedFolders, toggleFolder, openFile, 
  renamingId, setRenamingId, renamingValue, setRenamingValue, renameNode,
  createNode, moveNode, downloadNode, deleteNode, onDragStart, onDropOnNode,
  canEdit, canDelete
}: any) => {
  const node = nodes[nodeId];
  if (!node) return null;
  const isExpanded = expandedFolders[nodeId];
  const isActive = activeFileId === nodeId;
  const isRenaming = renamingId === nodeId;

  return (
    <div className="select-none">
      <div 
        className={cn("group flex items-center py-1 px-2 cursor-pointer hover:bg-secondary/40 rounded transition-all", isActive && "bg-primary/5 text-primary")}
        style={{ paddingLeft: `${depth * 8 + 8}px` }}
        draggable={canEdit} 
        onDragStart={(e) => onDragStart(e, nodeId)}
        onDragOver={(e) => { if (node.type === 'folder' && canEdit) e.preventDefault(); }}
        onDrop={(e) => canEdit && onDropOnNode(e, nodeId)}
        onClick={() => node.type === 'folder' ? toggleFolder(nodeId) : openFile(nodeId)}
      >
        <span className="mr-1.5 opacity-60 shrink-0">
          {node.type === 'folder' ? (isExpanded ? <ChevronDown size={12} className="text-primary" /> : <ChevronRight size={12} />) : getFileIcon(node.name, isActive)}
        </span>
        {isRenaming ? (
          <Input autoFocus className="h-5 text-[11px] py-0 px-1 bg-background" value={renamingValue}
            onChange={(e) => setRenamingValue(e.target.value)}
            onBlur={() => { if (renamingValue.trim()) renameNode(nodeId, renamingValue.trim()); setRenamingId(null); }}
            onKeyDown={(e) => e.key === 'Enter' && setRenamingId(null)}
          />
        ) : (
          <span className="text-[12px] truncate flex-1 font-medium">{node.name}</span>
        )}
        {(canEdit || canDelete) && (
          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-4 w-4"><MoreHorizontal size={10} /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                {node.type === 'folder' && canEdit && (
                  <>
                    <DropdownMenuItem className="text-xs" onClick={() => createNode(node.id, "new_file.ts", "file")}><FilePlus size={12} className="mr-2" /> New File</DropdownMenuItem>
                    <DropdownMenuItem className="text-xs" onClick={() => createNode(node.id, "new_folder", "folder")}><FolderPlus size={12} className="mr-2" /> New Folder</DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                {canEdit && <DropdownMenuItem className="text-xs" onClick={() => { setRenamingId(node.id); setRenamingValue(node.name); }}><Edit2 size={12} className="mr-2" /> Rename</DropdownMenuItem>}
                <DropdownMenuItem className="text-xs" onClick={() => downloadNode(node.id)}><Download size={12} className="mr-2" /> Download</DropdownMenuItem>
                
                {node.parentId && canEdit && (
                  <DropdownMenuItem className="text-xs" onClick={() => moveNode(node.id, null)}>
                    <ArrowUpCircle size={12} className="mr-2 text-primary" /> Move to Root
                  </DropdownMenuItem>
                )}
                
                {canDelete && <DropdownMenuItem className="text-xs text-destructive" onClick={() => deleteNode(node.id)}><Trash size={12} className="mr-2" /> Delete</DropdownMenuItem>}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
      {node.type === 'folder' && isExpanded && node.children && (
        <div className="mt-0.5">
          {node.children.map((childId: string) => (
            <FileTreeNode key={childId} nodeId={childId} depth={depth + 1} nodes={nodes} activeFileId={activeFileId} expandedFolders={expandedFolders} toggleFolder={toggleFolder} openFile={openFile} renamingId={renamingId} setRenamingId={setRenamingId} renamingValue={renamingValue} setRenamingValue={setRenamingValue} renameNode={renameNode} createNode={createNode} moveNode={moveNode} downloadNode={downloadNode} deleteNode={deleteNode} onDragStart={onDragStart} onDropOnNode={onDropOnNode} canEdit={canEdit} canDelete={canDelete} />
          ))}
        </div>
      )}
    </div>
  );
});

FileTreeNode.displayName = 'FileTreeNode';

export const Sidebar: React.FC = () => {
  const { 
    workspaces, activeWorkspaceId, setActiveWorkspace, createWorkspace, deleteWorkspace,
    nodes, activeFileId, openFile, deleteNode, renameNode,
    downloadNode, downloadWorkspace, createNode, moveNode, 
    moveNodeToWorkspace, importWorkspace,
    teams, activeTeamId, setActiveTeam, isTeamOwner, isTeamMember,
    invites, acceptInvite, rejectInvite
  } = useFiles();
  const { user, logout } = useAuth();
  
  const [sidebarTab, setSidebarTab] = useState<'explorer' | 'team'>('explorer');
  const [isCreatingWs, setIsCreatingWs] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renamingValue, setRenamingValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const activeWs = workspaces.find(w => w.id === activeWorkspaceId);
  const canEdit = activeWs?.teamId ? isTeamMember : (activeWs?.userId === user?.id);
  const canDelete = activeWs?.teamId ? isTeamMember : (activeWs?.userId === user?.id);

  const toggleFolder = useCallback((id: string) => setExpandedFolders(prev => ({ ...prev, [id]: !prev[id] })), []);

  const handleCreateWorkspace = async () => {
    if (newWsName.trim()) {
      await createWorkspace(newWsName.trim());
      setNewWsName(''); setIsCreatingWs(false);
    }
  };

  const onDragStart = useCallback((e: React.DragEvent, nodeId: string) => {
    e.dataTransfer.setData('nodeId', nodeId);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const onDropOnNode = useCallback((e: React.DragEvent, targetId: string) => {
    e.preventDefault(); e.stopPropagation();
    const nodeId = e.dataTransfer.getData('nodeId');
    if (nodeId && nodeId !== targetId) {
      const targetNode = nodes[targetId];
      if (targetNode?.type === 'folder') moveNode(nodeId, targetId);
    }
  }, [nodes, moveNode]);

  const onDropOnWorkspace = useCallback((e: React.DragEvent, workspaceId: string) => {
    e.preventDefault(); e.stopPropagation();
    const nodeId = e.dataTransfer.getData('nodeId');
    if (nodeId) {
      const node = nodes[nodeId];
      if (node && node.workspaceId !== workspaceId) moveNodeToWorkspace(nodeId, workspaceId);
    }
  }, [nodes, moveNodeToWorkspace]);

  return (
    <div className="w-64 border-r bg-sidebar flex flex-col h-full shrink-0 shadow-xl z-20 overflow-hidden">
      <div className="p-3 border-b space-y-3 bg-sidebar/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
              <Layers className="text-primary" size={16} />
            </div>
            <h1 className="font-black text-[10px] tracking-widest uppercase text-foreground/90">CodeFlow</h1>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-primary hover:bg-primary/10" onClick={() => {
            const input = document.createElement('input'); input.type = 'file'; input.accept = '.zip';
            input.onchange = (e) => { const file = (e.target as HTMLInputElement).files?.[0]; if (file) importWorkspace(file); };
            input.click();
          }}>
            <FileUp size={14} />
          </Button>
        </div>

        <Tabs value={sidebarTab} onValueChange={(v: any) => setSidebarTab(v)} className="w-full">
          <TabsList className="grid grid-cols-2 h-7 bg-background/50 p-0.5 border border-white/5">
            <TabsTrigger value="explorer" className="text-[8px] font-black uppercase tracking-widest">Files</TabsTrigger>
            <TabsTrigger value="team" className="text-[8px] font-black uppercase tracking-widest">Team</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <ScrollArea className="flex-1">
        {sidebarTab === 'explorer' ? (
          <div className="px-3 py-2 space-y-4">
            <div className="relative">
              <Search size={10} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search files..." className="h-7 pl-8 text-[10px] bg-background/50 border-none ring-1 ring-border" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <LayoutGrid size={12} className="text-primary/60" />
                  <span className="text-[9px] font-black uppercase text-muted-foreground tracking-[0.1em]">Workspaces</span>
                </div>
                <Button variant="ghost" size="icon" className="h-5 w-5 hover:bg-primary/10 hover:text-primary" onClick={() => setIsCreatingWs(true)}><Plus size={12} /></Button>
              </div>
              
              {isCreatingWs && (
                <div className="flex items-center gap-1 px-1 animate-in fade-in slide-in-from-top-1">
                  <Input autoFocus placeholder="Workspace name..." className="h-7 text-[10px] bg-background/40" value={newWsName} onChange={e => setNewWsName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCreateWorkspace()} />
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-primary" onClick={handleCreateWorkspace}><Check size={14} /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setIsCreatingWs(false)}><X size={14} /></Button>
                </div>
              )}

              <div className="space-y-0.5">
                {workspaces.map(ws => {
                  const wsTeam = teams.find(t => t.id === ws.teamId);
                  return (
                    <div key={ws.id} onClick={() => setActiveWorkspace(ws.id)} onDragOver={e => e.preventDefault()} onDrop={e => onDropOnWorkspace(e, ws.id)} className={cn("flex items-center justify-between group px-2 py-1.5 rounded cursor-pointer text-[11px] transition-all", activeWorkspaceId === ws.id ? "bg-primary/10 text-primary border border-primary/20" : "hover:bg-secondary/40 text-muted-foreground")}>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2 truncate text-[11px]">
                          {ws.teamId ? <Shield size={10} className="text-primary/50" /> : <Zap size={10} className="text-muted-foreground/50" />}
                          <span className="truncate font-bold tracking-tight">{ws.name}</span>
                        </div>
                        {wsTeam && (
                          <span className="text-[7px] uppercase font-black text-primary/40 pl-4">{wsTeam.name}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100">
                        <Download size={10} className="hover:text-primary" onClick={e => { e.stopPropagation(); downloadWorkspace(ws.id); }} />
                        <Trash size={10} className="hover:text-destructive" onClick={e => { e.stopPropagation(); deleteWorkspace(ws.id); }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between border-t border-white/5 pt-3 mb-1">
                <div className="flex items-center gap-2">
                  <Folder size={12} className="text-primary/60" />
                  <span className="text-[9px] font-black uppercase text-muted-foreground tracking-[0.1em]">Explorer</span>
                </div>
                {activeWs && (
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-5 w-5 hover:bg-primary/10 hover:text-primary" title="New File" onClick={() => createNode(null, "new_file.ts", "file")}><FilePlus size={10} /></Button>
                    <Button variant="ghost" size="icon" className="h-5 w-5 hover:bg-primary/10 hover:text-primary" title="New Folder" onClick={() => createNode(null, "new_folder", "folder")}><FolderPlus size={10} /></Button>
                  </div>
                )}
              </div>
              <div className="space-y-0.5">
                {activeWs ? (activeWs.rootFileIds || []).map(rid => (
                  <FileTreeNode key={rid} nodeId={rid} depth={0} nodes={nodes} activeFileId={activeFileId} expandedFolders={expandedFolders} toggleFolder={toggleFolder} openFile={openFile} renamingId={renamingId} setRenamingId={setRenamingId} renamingValue={renamingValue} setRenamingValue={setRenamingValue} renameNode={renameNode} createNode={createNode} moveNode={moveNode} downloadNode={downloadNode} deleteNode={deleteNode} onDragStart={onDragStart} onDropOnNode={onDropOnNode} canEdit={canEdit} canDelete={canDelete} />
                )) : <div className="text-center py-6 text-[10px] font-black uppercase tracking-widest opacity-20">No Workspace</div>}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 space-y-4">
            <div className="space-y-3">
              <label className="text-[8px] font-black uppercase text-primary tracking-[0.2em] flex items-center gap-1.5"><Building2 size={10} /> Active Team</label>
              <Select value={activeTeamId || ''} onValueChange={setActiveTeam}>
                <SelectTrigger className="h-7 text-[9px] bg-background/30 border-white/5">
                  <SelectValue placeholder="Select team..." />
                </SelectTrigger>
                <SelectContent>
                  {teams.map(team => <SelectItem key={team.id} value={team.id} className="text-[9px] font-bold">{team.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {activeTeamId ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <LayoutGrid size={12} className="text-primary" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Workspaces</span>
                    </div>
                  </div>
                  
                  <div className="space-y-0.5">
                    {workspaces.filter(ws => ws.teamId === activeTeamId).map(ws => (
                      <div key={ws.id} onClick={() => setActiveWorkspace(ws.id)} className={cn("flex items-center justify-between group px-2 py-1.5 rounded cursor-pointer text-[11px]", activeWorkspaceId === ws.id ? "bg-primary/10 text-primary border border-primary/20" : "hover:bg-secondary/40 text-muted-foreground")}>
                        <div className="flex items-center gap-2 truncate">
                          <Shield size={10} className="text-primary/50" />
                          <span className="truncate font-bold">{ws.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100">
                          <Download size={10} className="hover:text-primary" onClick={e => { e.stopPropagation(); downloadWorkspace(ws.id); }} />
                          {isTeamMember && <Trash size={10} className="hover:text-destructive" onClick={e => { e.stopPropagation(); deleteWorkspace(ws.id); }} />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between border-t border-white/5 pt-3 mb-1">
                    <div className="flex items-center gap-2">
                      <Folder size={12} className="text-primary/60" />
                      <span className="text-[9px] font-black uppercase text-muted-foreground tracking-[0.1em]">Files</span>
                    </div>
                    {activeWs && activeWs.teamId === activeTeamId && (
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-5 w-5 hover:bg-primary/10 hover:text-primary" title="New File" onClick={() => createNode(null, "new_file.ts", "file")}><FilePlus size={10} /></Button>
                        <Button variant="ghost" size="icon" className="h-5 w-5 hover:bg-primary/10 hover:text-primary" title="New Folder" onClick={() => createNode(null, "new_folder", "folder")}><FolderPlus size={10} /></Button>
                      </div>
                    )}
                  </div>
                  <div className="space-y-0.5">
                    {activeWs && activeWs.teamId === activeTeamId ? (activeWs.rootFileIds || []).map(rid => (
                      <FileTreeNode key={rid} nodeId={rid} depth={0} nodes={nodes} activeFileId={activeFileId} expandedFolders={expandedFolders} toggleFolder={toggleFolder} openFile={openFile} renamingId={renamingId} setRenamingId={setRenamingId} renamingValue={renamingValue} setRenamingValue={setRenamingValue} renameNode={renameNode} createNode={createNode} moveNode={moveNode} downloadNode={downloadNode} deleteNode={deleteNode} onDragStart={onDragStart} onDropOnNode={onDropOnNode} canEdit={isTeamMember} canDelete={isTeamMember} />
                    )) : <div className="text-center py-6 text-[10px] font-black uppercase tracking-widest opacity-20">Select workspace</div>}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 space-y-2">
                <Shield size={24} className="mx-auto opacity-10" />
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest leading-relaxed">Select a team to collaborate.</p>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      <div className="p-2 border-t bg-sidebar/50 backdrop-blur-md space-y-2 shrink-0">
        {invites.length > 0 && (
          <div className="space-y-1">
            <label className="text-[7px] font-black uppercase text-primary tracking-widest mb-1 px-1 flex items-center gap-1.5">Invites</label>
            {invites.map((invite) => (
              <div key={invite.id} className="bg-primary text-white text-[8px] font-black uppercase rounded p-1.5 flex items-center justify-between">
                <span className="truncate">{invite.teamName}</span>
                <div className="flex items-center gap-0.5">
                  <Button size="icon" variant="ghost" className="h-4 w-4 hover:bg-white/20" onClick={() => acceptInvite(invite.id)}><Check size={10} /></Button>
                  <Button size="icon" variant="ghost" className="h-4 w-4 hover:bg-white/20" onClick={() => rejectInvite(invite.id)}><X size={10} /></Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {user && (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 px-1">
              <div className="flex items-center gap-1.5 overflow-hidden flex-1">
                <Avatar className="h-7 w-7 border border-primary/30 shrink-0">
                  <AvatarImage src={user.photoURL ?? undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-[9px] font-black uppercase">
                    {(user.username || "??").slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-black tracking-tight truncate leading-none mb-0.5">{user.username}</span>
                  <Badge variant="outline" className="h-3 text-[6px] px-1 border-primary/20 text-primary/80 bg-primary/5 uppercase font-black">
                    {user.isAnonymous ? 'Guest' : 'Pro'}
                  </Badge>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive shrink-0" onClick={logout}>
                <LogOut size={12} />
              </Button>
            </div>
            
            <div className="pt-1.5 border-t border-white/5 flex flex-col items-center gap-1 text-center">
              <div className="flex items-center justify-center gap-1 opacity-40">
                <Copyright size={8} />
                <span className="text-[6px] font-black uppercase tracking-widest text-muted-foreground">
                  2026 Frostvale Studio • All Rights Reserved
                </span>
              </div>
              <LicenseDialog 
                trigger={
                  <Button variant="link" className="h-auto p-0 text-[6px] font-black uppercase tracking-widest text-primary/50 hover:text-primary transition-colors">
                    View License
                  </Button>
                }
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
