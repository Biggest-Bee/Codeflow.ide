'use client';

import React, { useState, useMemo } from 'react';
import { Search, Package, Plus, Layout, Globe, Trash2, Box, X, Check, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { DEPENDENCIES, DEPENDENCY_CATEGORIES, type Dependency } from '@/lib/dependency-data';
import { Workspace } from '@/lib/types';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DependencyExplorerProps {
  workspaces: Workspace[];
  onInstallRequest: (pkg: Dependency, workspaceIds: string[]) => void;
}

export const DependencyExplorer: React.FC<DependencyExplorerProps> = ({ workspaces, onInstallRequest }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedWorkspaces, setSelectedWorkspaces] = useState<Set<string>>(new Set());
  const [pendingPkg, setPendingPkg] = useState<Dependency | null>(null);

  const filtered = useMemo(() => {
    return DEPENDENCIES.filter(d => {
      const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase()) || 
                           d.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === "All" || d.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, selectedCategory]);

  const handleInstallClick = (pkg: Dependency) => {
    setPendingPkg(pkg);
  };

  const handleFinalizeInstall = () => {
    if (selectedWorkspaces.size === 0) {
      toast({
        title: "No Workspace Selected",
        description: "Select at least one workspace to continue.",
        variant: "destructive"
      });
      return;
    }
    
    if (pendingPkg) {
      onInstallRequest(pendingPkg, Array.from(selectedWorkspaces));
      setPendingPkg(null);
      setSelectedWorkspaces(new Set());
    }
  };

  const toggleWorkspace = (id: string) => {
    setSelectedWorkspaces(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="flex flex-col h-[500px] overflow-hidden bg-sidebar/50 w-full relative">
      {/* Search & Categories */}
      <div className="p-3 space-y-3 bg-background/20 border-b shrink-0">
        <div className="relative">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search 700+ dependencies..." 
            className="pl-8 h-8 text-[11px] bg-background/50 border-white/5"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1">
          {DEPENDENCY_CATEGORIES.map(cat => (
            <Button 
              key={cat}
              variant={selectedCategory === cat ? "secondary" : "ghost"} 
              size="sm" 
              className="h-5 text-[9px] uppercase font-black px-2 shrink-0"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Catalog List - Ensuring full vertical scrollability */}
      <ScrollArea className="flex-1">
        <div className="grid grid-cols-1 gap-1.5 p-3">
          {filtered.map(pkg => (
            <div 
              key={pkg.name} 
              className="flex items-center justify-between p-2.5 rounded border bg-background/30 hover:border-primary/40 transition-all group"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="h-8 w-8 rounded bg-primary/5 flex items-center justify-center border border-primary/10 shrink-0">
                  <Package size={14} className="text-primary" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[11px] font-black uppercase truncate leading-none">{pkg.name}</span>
                  <span className="text-[9px] text-muted-foreground truncate leading-tight mt-1 opacity-70">{pkg.description}</span>
                  <Badge variant="outline" className="w-fit text-[7px] h-3.5 mt-1 border-primary/20 bg-primary/5 text-primary uppercase px-1">
                    {pkg.type}
                  </Badge>
                </div>
              </div>
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-8 w-8 shrink-0 hover:bg-primary/20 hover:text-primary"
                onClick={() => handleInstallClick(pkg)}
              >
                <Plus size={14} />
              </Button>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 opacity-20">
              <Package size={32} />
              <p className="text-[10px] font-black uppercase mt-2">No Modules Found</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Workspace Selection Card (Persistent Popup) */}
      {pendingPkg && (
        <div className="absolute inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-[280px] max-h-[420px] flex flex-col bg-sidebar border-primary/30 shadow-2xl shadow-black/50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <CardHeader className="p-3 border-b bg-primary/10 flex flex-row items-center justify-between space-y-0 shrink-0">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                <Layout size={12} /> Route to Workspace
              </CardTitle>
              <Button variant="ghost" size="icon" className="h-5 w-5 hover:bg-destructive/20 hover:text-destructive" onClick={() => setPendingPkg(null)}>
                <X size={12} />
              </Button>
            </CardHeader>
            <CardContent className="p-3 space-y-4 flex-1 overflow-hidden flex flex-col">
              <div className="space-y-1 flex-1 flex flex-col min-h-0">
                <p className="text-[8px] font-bold uppercase text-muted-foreground mb-2 shrink-0">Installing: {pendingPkg.name}</p>
                <ScrollArea className="flex-1 border rounded bg-background/30 p-1">
                  <div className="space-y-0.5">
                    {workspaces.map(ws => (
                      <div 
                        key={ws.id} 
                        className={cn(
                          "flex items-center gap-2 p-1.5 rounded cursor-pointer transition-colors",
                          selectedWorkspaces.has(ws.id) ? "bg-primary/10" : "hover:bg-white/5"
                        )}
                        onClick={() => toggleWorkspace(ws.id)}
                      >
                        <Checkbox checked={selectedWorkspaces.has(ws.id)} className="h-3 w-3" />
                        <span className={cn("text-[10px] truncate flex-1", selectedWorkspaces.has(ws.id) ? "text-primary font-bold" : "text-muted-foreground")}>
                          {ws.name}
                        </span>
                      </div>
                    ))}
                    {workspaces.length === 0 && (
                      <p className="text-[9px] text-muted-foreground text-center py-4 uppercase font-black tracking-widest opacity-30">No Workspaces Available</p>
                    )}
                  </div>
                </ScrollArea>
              </div>
              <Button 
                className="w-full h-9 shrink-0 font-black uppercase text-[10px] gap-2 shadow-lg shadow-primary/20" 
                onClick={handleFinalizeInstall}
                disabled={selectedWorkspaces.size === 0}
              >
                <Check size={14} /> Finalize Installation
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
