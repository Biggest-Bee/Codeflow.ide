'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { FileNode, Workspace, FileType, Team, TeamInvite, UserSession, Member, getLanguageFromFileName } from '@/lib/types';
import { 
  collection, 
  doc, 
  onSnapshot, 
  query, 
  where,
  writeBatch,
  Firestore,
  setDoc,
  updateDoc,
  arrayUnion,
  query as firestoreQuery,
  orderBy,
  deleteDoc,
  arrayRemove,
  limit,
  getDocs
} from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { useFirebase } from '@/firebase';
import { v4 as uuidv4 } from 'uuid';
import { setDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { toast } from '@/hooks/use-toast';
import JSZip from 'jszip';

interface FileContextType {
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  nodes: Record<string, FileNode>;
  activeFileId: string | null;
  openFileIds: string[];
  teams: Team[];
  activeTeamId: string | null;
  teamMembers: Member[];
  isTeamOwner: boolean;
  isTeamMember: boolean;
  invites: TeamInvite[];
  allUsers: UserSession[];
  selectedServerId: string;

  createWorkspace: (name: string) => Promise<string>;
  deleteWorkspace: (id: string) => Promise<void>;
  setActiveWorkspace: (id: string | null) => void;
  renameWorkspace: (id: string, name: string) => void;
  assignWorkspaceToTeam: (wsId: string, teamId: string) => Promise<void>;
  unassignWorkspaceFromTeam: (wsId: string, teamId: string) => Promise<void>;
  addCollaborator: (workspaceId: string, userId: string) => Promise<void>;
  kickMember: (teamId: string, userId: string) => Promise<void>;
  transferOwnership: (teamId: string, newOwnerId: string) => Promise<void>;
  createNode: (parentId: string | null, name: string, type: FileType, language?: string, content?: string) => string;
  deleteNode: (id: string) => Promise<void>;
  updateNode: (id: string, updates: Partial<FileNode>) => void;
  renameNode: (id: string, newName: string) => void;
  moveNode: (id: string, newParentId: string | null) => Promise<void>;
  moveNodeToWorkspace: (id: string, targetWorkspaceId: string) => Promise<void>;
  openFile: (id: string) => void;
  closeFile: (id: string) => void;
  setActiveFile: (id: string | null) => void;
  downloadWorkspace: (id: string) => Promise<void>;
  downloadNode: (id: string) => Promise<void>;
  uploadToFolder: (parentId: string | null, files: FileList) => Promise<void>;
  importWorkspace: (file: File) => Promise<void>;
  getNodePath: (id: string) => string;
  createTeam: (name: string) => Promise<void>;
  deleteTeam: (id: string) => Promise<void>;
  setActiveTeam: (id: string | null) => void;
  updateTeamApiKey: (teamId: string, apiKey: string) => Promise<void>;
  sendTeamInvite: (teamId: string, targetEmail: string) => Promise<void>;
  acceptInvite: (inviteId: string) => Promise<void>;
  rejectInvite: (inviteId: string) => Promise<void>;
  setSelectedServer: (serverId: string) => Promise<void>;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export const FileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { firestore: db } = useFirebase();
  
  const [personalWorkspaces, setPersonalWorkspaces] = useState<Workspace[]>([]);
  const [teamWorkspaces, setTeamWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
  const [nodes, setNodes] = useState<Record<string, FileNode>>({});
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [openFileIds, setOpenFileIds] = useState<string[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [activeTeamId, setActiveTeamId] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<TeamInvite[]>([]);
  const [allUsers, setAllUsers] = useState<UserSession[]>([]);
  const [selectedServerId, setSelectedServerId] = useState<string>('us-east-1');

  const hasAutoSelected = useRef(false);
  const saveTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({});

  const workspaces = useMemo(() => {
    return [...personalWorkspaces, ...teamWorkspaces].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }, [personalWorkspaces, teamWorkspaces]);

  const getNodePath = useCallback((id: string): string => {
    const node = nodes[id];
    if (!node) return '';
    if (!node.parentId) return node.name;
    return `${getNodePath(node.parentId)} / ${node.name}`;
  }, [nodes]);

  const isTeamOwner = useMemo(() => {
    if (!activeTeamId || !user) return false;
    return teams.find(t => t.id === activeTeamId)?.ownerId === user.id;
  }, [activeTeamId, user, teams]);

  const isTeamMember = useMemo(() => {
    if (!activeTeamId || !user) return false;
    return teamMembers.some(m => m.userId === user.id) || isTeamOwner;
  }, [activeTeamId, user, teamMembers, isTeamOwner]);

  const createWorkspace = useCallback(async (name: string) => {
    if (!user || !db) return '';
    const id = uuidv4();
    const ws: Workspace = {
      id,
      name,
      userId: user.id,
      rootFileIds: [],
      createdAt: Date.now(),
      collaboratorIds: [],
      collaborators: [],
      ...(activeTeamId ? { teamId: activeTeamId } : {})
    };
    
    const path = activeTeamId 
      ? `teams/${activeTeamId}/workspaces` 
      : `users/${user.id}/workspaces`;
      
    await setDoc(doc(db as Firestore, path, id), ws);
    setActiveWorkspaceId(id);
    return id;
  }, [user, db, activeTeamId]);

  const deleteWorkspace = useCallback(async (id: string) => {
    if (!user || !db) return;
    const ws = workspaces.find(w => w.id === id);
    if (!ws) return;
    
    const path = ws.teamId 
      ? `teams/${ws.teamId}/workspaces` 
      : `users/${user.id}/workspaces`;
      
    await deleteDoc(doc(db as Firestore, path, id));
    if (activeWorkspaceId === id) setActiveWorkspaceId(null);
  }, [user, db, activeWorkspaceId, workspaces]);

  const renameWorkspace = useCallback(async (id: string, name: string) => {
    if (!db || !user) return;
    const ws = workspaces.find(w => w.id === id);
    if (!ws) return;
    
    const path = ws.teamId 
      ? `teams/${ws.teamId}/workspaces` 
      : `users/${user.id}/workspaces`;
      
    updateDocumentNonBlocking(doc(db as Firestore, path, id), { name });
  }, [db, user, workspaces]);

  const assignWorkspaceToTeam = useCallback(async (wsId: string, teamId: string) => {
    if (!db || !user) return;
    const ws = personalWorkspaces.find(w => w.id === wsId);
    if (!ws) return;

    const batch = writeBatch(db as Firestore);
    const newWsRef = doc(db as Firestore, `teams/${teamId}/workspaces`, wsId);
    const oldWsRef = doc(db as Firestore, `users/${user.id}/workspaces`, wsId);

    batch.set(newWsRef, { 
      ...ws, 
      teamId, 
      userId: user.id, 
      collaborators: [], 
      collaboratorIds: []
    });
    batch.delete(oldWsRef);

    await batch.commit();
    toast({ title: "Workspace Assigned", description: `${ws.name} is now shared.` });
  }, [db, user, personalWorkspaces]);

  const unassignWorkspaceFromTeam = useCallback(async (wsId: string, teamId: string) => {
    if (!db || !user) return;
    const ws = teamWorkspaces.find(w => w.id === wsId);
    if (!ws) return;

    const batch = writeBatch(db as Firestore);
    const newWsRef = doc(db as Firestore, `users/${ws.userId}/workspaces`, wsId);
    const oldWsRef = doc(db as Firestore, `teams/${teamId}/workspaces`, wsId);

    const { teamId: _, ...workspaceData } = ws;
    batch.set(newWsRef, { 
      ...workspaceData,
      collaborators: [], 
      collaboratorIds: []
    });
    batch.delete(oldWsRef);

    await batch.commit();
    toast({ title: "Workspace Reverted", description: `${ws.name} is now private.` });
  }, [db, user, teamWorkspaces]);

  const addCollaborator = useCallback(async (wsId: string, targetUserId: string) => {
    if (!db || !user) return;
    const ws = workspaces.find(w => w.id === wsId);
    if (!ws) return;
    
    const path = ws.teamId 
      ? `teams/${ws.teamId}/workspaces` 
      : `users/${ws.userId}/workspaces`;
      
    await updateDoc(doc(db as Firestore, path, wsId), { 
      collaborators: arrayUnion({ userId: targetUserId }), 
      collaboratorIds: arrayUnion(targetUserId) 
    });
    toast({ title: "User Added" });
  }, [db, user, workspaces]);

  const kickMember = useCallback(async (teamId: string, userId: string) => {
    if (!db || !user) return;
    const memberRef = doc(db as Firestore, `teams/${teamId}/members`, userId);
    await deleteDoc(memberRef);
    toast({ title: "Member Removed" });
  }, [db, user]);

  const transferOwnership = useCallback(async (teamId: string, newOwnerId: string) => {
    if (!db || !user) return;
    const team = teams.find(t => t.id === teamId);
    if (!team || team.ownerId !== user.id) return;
    
    await updateDoc(doc(db as Firestore, 'teams', teamId), { ownerId: newOwnerId });
    toast({ title: "Owner Updated" });
  }, [db, user, teams]);

  const createNode = useCallback((parentId: string | null, name: string, type: FileType, language?: string, content = '') => {
    if (!user || !db || !activeWorkspaceId) return '';
    const currentWs = workspaces.find(w => w.id === activeWorkspaceId);
    if (!currentWs) return '';
    const id = uuidv4();
    const ownerId = currentWs.userId;
    const teamId = currentWs.teamId; // Capture teamId for security rules
    
    const detectedLang = type === 'file' ? (language || getLanguageFromFileName(name)) : undefined;
    
    const newNode: any = { 
      id, 
      name, 
      type, 
      parentId, 
      workspaceId: activeWorkspaceId, 
      teamId, 
      ownerId, 
      createdAt: Date.now(), 
      updatedAt: Date.now() 
    };
    if (type === 'file') { 
      newNode.content = content; 
      newNode.language = detectedLang; 
    } else { 
      newNode.children = []; 
    }
    
    setDocumentNonBlocking(doc(db as Firestore, `users/${ownerId}/nodes`, id), newNode, { merge: true });
    
    if (parentId) {
      updateDocumentNonBlocking(doc(db as Firestore, `users/${ownerId}/nodes`, parentId), { children: arrayUnion(id) });
    } else {
      const wsPath = currentWs.teamId 
        ? `teams/${currentWs.teamId}/workspaces` 
        : `users/${ownerId}/workspaces`;
      updateDocumentNonBlocking(doc(db as Firestore, wsPath, activeWorkspaceId), { rootFileIds: arrayUnion(id) });
    }
    return id;
  }, [user, db, activeWorkspaceId, workspaces]);

  const updateNode = useCallback((id: string, updates: Partial<FileNode>) => {
    const node = nodes[id];
    if (!node || !user || !db) return;
    
    const finalUpdates = { ...updates };
    if (updates.name && node.type === 'file') {
      finalUpdates.language = getLanguageFromFileName(updates.name);
    }
    
    setNodes(prev => ({ ...prev, [id]: { ...prev[id], ...finalUpdates } }));
    if (saveTimeoutRef.current[id]) clearTimeout(saveTimeoutRef.current[id]);
    saveTimeoutRef.current[id] = setTimeout(() => {
      updateDocumentNonBlocking(doc(db as Firestore, `users/${node.ownerId}/nodes`, id), { ...finalUpdates, updatedAt: Date.now() });
    }, 500); 
  }, [user, db, nodes]);

  const deleteNode = useCallback(async (id: string) => {
    if (!db || !user) return;
    const node = nodes[id];
    if (!node) return;
    const batch = writeBatch(db as Firestore);
    const ownerId = node.ownerId;
    const deleteRecursive = (nodeId: string) => {
      const n = nodes[nodeId];
      if (!n) return;
      batch.delete(doc(db as Firestore, `users/${ownerId}/nodes`, nodeId));
      n.children?.forEach(deleteRecursive);
    };
    deleteRecursive(id);
    if (node.parentId) {
      batch.update(doc(db as Firestore, `users/${ownerId}/nodes`, node.parentId), { children: arrayRemove(id) });
    } else {
      const ws = workspaces.find(w => w.id === node.workspaceId);
      if (ws) {
        const wsPath = ws.teamId 
          ? `teams/${ws.teamId}/workspaces` 
          : `users/${ownerId}/workspaces`;
        batch.update(doc(db as Firestore, wsPath, node.workspaceId), { rootFileIds: arrayRemove(id) });
      }
    }
    await batch.commit();
  }, [db, user, nodes, workspaces]);

  const renameNode = useCallback((id: string, name: string) => {
    updateNode(id, { name });
  }, [updateNode]);

  const moveNode = useCallback(async (id: string, pid: string | null) => {
    if (!db || !user) return;
    const node = nodes[id];
    const batch = writeBatch(db as Firestore);
    const ws = workspaces.find(w => w.id === node.workspaceId);
    if (!ws) return;

    const wsPath = ws.teamId 
      ? `teams/${ws.teamId}/workspaces` 
      : `users/${node.ownerId}/workspaces`;

    if (node.parentId) {
      batch.update(doc(db as Firestore, `users/${node.ownerId}/nodes`, node.parentId), { children: arrayRemove(id) });
    } else {
      batch.update(doc(db as Firestore, wsPath, node.workspaceId), { rootFileIds: arrayRemove(id) });
    }
    
    if (pid) {
      batch.update(doc(db as Firestore, `users/${node.ownerId}/nodes`, pid), { children: arrayUnion(id) });
    } else {
      batch.update(doc(db as Firestore, wsPath, node.workspaceId), { rootFileIds: arrayUnion(id) });
    }
    
    batch.update(doc(db as Firestore, `users/${node.ownerId}/nodes`, id), { parentId: pid });
    await batch.commit();
  }, [db, user, nodes, workspaces]);

  const moveNodeToWorkspace = useCallback(async (id: string, twid: string) => {
    if (!db || !user) return;
    const node = nodes[id];
    const tws = workspaces.find(w => w.id === twid);
    if (!tws) return;
    
    const batch = writeBatch(db as Firestore);
    batch.update(doc(db as Firestore, `users/${node.ownerId}/nodes`, id), { 
      workspaceId: twid, 
      teamId: tws.teamId, // Sync teamId on move
      ownerId: tws.userId, 
      parentId: null 
    });
    
    const wsPath = tws.teamId 
      ? `teams/${tws.teamId}/workspaces` 
      : `users/${tws.userId}/workspaces`;
      
    batch.update(doc(db as Firestore, wsPath, twid), { rootFileIds: arrayUnion(id) });
    await batch.commit();
  }, [db, user, nodes, workspaces]);

  const createTeam = useCallback(async (name: string) => {
    if (!user || !db || user.isAnonymous) return;
    
    const id = uuidv4();
    await setDoc(doc(db as Firestore, 'teams', id), { id, name, ownerId: user.id, createdAt: Date.now() });
    
    await setDoc(doc(db as Firestore, `teams/${id}/members`, user.id), { 
      userId: user.id, 
      username: user.username,
      email: user.email,
      joinedAt: Date.now() 
    });
    
    setActiveTeamId(id);
    toast({ title: "Team Created" });
  }, [user, db]);

  const deleteTeam = useCallback(async (teamId: string) => {
    if (!db || !user) return;
    const team = teams.find(t => t.id === teamId);
    if (!team || team.ownerId !== user.id) {
      toast({ title: "Action Unauthorized", variant: "destructive" });
      return;
    }
    const batch = writeBatch(db as Firestore);
    
    try {
      const membersSnap = await getDocs(collection(db as Firestore, `teams/${teamId}/members`));
      membersSnap.docs.forEach(d => batch.delete(d.ref));
      
      const workspacesSnap = await getDocs(collection(db as Firestore, `teams/${teamId}/workspaces`));
      workspacesSnap.docs.forEach(d => batch.delete(d.ref));

      batch.delete(doc(db as Firestore, 'teams', teamId));
      
      await batch.commit();
      
      if (activeTeamId === teamId) {
        setActiveTeamId(null);
      }
      toast({ title: "Team Deleted" });
    } catch (e: any) {
      toast({ title: "Action Failed", description: e.message, variant: "destructive" });
    }
  }, [db, user, teams, activeTeamId]);

  const updateTeamApiKey = useCallback(async (teamId: string, apiKey: string) => {
    if (db) await updateDoc(doc(db as Firestore, 'teams', teamId), { teamApiKey: apiKey });
  }, [db]);

  const sendTeamInvite = useCallback(async (teamId: string, targetEmail: string) => {
    if (!db || !user) return;
    const team = teams.find(t => t.id === teamId);
    if (!team) return;

    const usersRef = collection(db as Firestore, 'users');
    const q = firestoreQuery(usersRef, where("email", "==", targetEmail.trim()), limit(1));
    const snap = await getDocs(q);
    
    if (snap.empty) {
      toast({ title: "Account not found", variant: "destructive" });
      return;
    }

    const targetUser = snap.docs[0].data() as UserSession;
    const inviteId = uuidv4();
    
    await setDoc(doc(db as Firestore, `users/${targetUser.id}/invites`, inviteId), {
      id: inviteId, teamId, teamName: team.name, senderId: user.id, senderName: user.username, createdAt: Date.now()
    });
    toast({ title: "Invite Sent" });
  }, [db, user, teams]);

  const acceptInvite = useCallback(async (inviteId: string) => {
    if (!db || !user) return;
    const invitesRef = collection(db as Firestore, `users/${user.id}/invites`);
    const q = firestoreQuery(invitesRef, where("id", "==", inviteId));
    const snap = await getDocs(q);
    const inviteData = snap.docs[0]?.data();
    if (!inviteData) return;

    const batch = writeBatch(db as Firestore);
    batch.set(doc(db as Firestore, `teams/${inviteData.teamId}/members`, user.id), {
      userId: user.id,
      username: user.username,
      email: user.email,
      joinedAt: Date.now()
    });
    batch.delete(doc(db as Firestore, `users/${user.id}/invites`, inviteId));
    await batch.commit();
    setActiveTeamId(inviteData.teamId);
    toast({ title: "Joined Team" });
  }, [db, user]);

  const rejectInvite = useCallback(async (inviteId: string) => {
    if (!db || !user) return;
    await deleteDoc(doc(db as Firestore, `users/${user.id}/invites`, inviteId));
    toast({ title: "Invite Rejected" });
  }, [db, user]);

  const setSelectedServer = useCallback(async (serverId: string) => {
    setSelectedServerId(serverId);
    if (user?.id && db) {
      await setDoc(doc(db as Firestore, 'users', user.id), { selectedServer: serverId }, { merge: true });
      toast({ title: "Server Switched", description: `Routing through ${serverId}` });
    }
  }, [user?.id, db]);

  const openFile = useCallback((id: string) => {
    if (nodes[id]?.type === 'file') {
      setOpenFileIds(p => p.includes(id) ? p : [...p, id]);
      setActiveFileId(id);
    }
  }, [nodes]);

  const closeFile = useCallback((id: string) => {
    setOpenFileIds(p => {
      const n = p.filter(o => o !== id);
      if (activeFileId === id) setActiveFileId(n[n.length - 1] || null);
      return n;
    });
  }, [activeFileId]);

  const downloadWorkspace = useCallback(async (id: string) => {
    const ws = workspaces.find(w => w.id === id);
    if (!ws) return;
    const zip = new JSZip();
    const add = (nid: string, p: string) => {
      const n = nodes[nid];
      if (!n) return;
      const f = p ? `${p}/${n.name}` : n.name;
      if (n.type === 'file') zip.file(f, n.content || '');
      else n.children?.forEach(c => add(c, f));
    };
    ws.rootFileIds.forEach(r => add(r, ''));
    const link = document.createElement('a');
    link.href = URL.createObjectURL(await zip.generateAsync({ type: 'blob' }));
    link.download = `${ws.name}.zip`; link.click();
  }, [workspaces, nodes]);

  const downloadNode = useCallback(async (id: string) => {
    const n = nodes[id]; if (!n) return;
    if (n.type === 'file') {
      const blob = new Blob([n.content || ''], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = n.name; a.click();
    }
  }, [nodes]);

  const uploadToFolder = useCallback(async (pid: string | null, fs: FileList) => {
    if (!db || !user || !activeWorkspaceId) return;
    for (const f of Array.from(fs)) {
      const content = await new Promise<string>(r => { 
        const reader = new FileReader(); 
        reader.onload = e => r(e.target?.result as string); 
        reader.readAsText(f); 
      });
      createNode(pid, f.name, 'file', undefined, content);
    }
  }, [db, user, activeWorkspaceId, createNode]);

  const importWorkspace = useCallback(async (file: File) => {
    if (!user || !db) return;
    const wsId = uuidv4();
    const path = activeTeamId ? `teams/${activeTeamId}/workspaces` : `users/${user.id}/workspaces`;
    await setDoc(doc(db as Firestore, path, wsId), { 
      id: wsId, 
      name: file.name.replace('.zip', ''), 
      userId: user.id, 
      collaboratorIds: [], 
      collaborators: [], 
      rootFileIds: [], 
      createdAt: Date.now(),
      ...(activeTeamId ? { teamId: activeTeamId } : {})
    });
    setActiveWorkspaceId(wsId);
  }, [user, db, activeTeamId]);

  useEffect(() => {
    if (!user?.id || !db) return;
    const teamsRef = collection(db as Firestore, 'teams');
    const qOwner = firestoreQuery(teamsRef, where("ownerId", "==", user.id));
    
    const unsubTeams = onSnapshot(qOwner, (snapshot) => {
      setTeams(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Team)));
    });
    
    return unsubTeams;
  }, [user?.id, db]);

  useEffect(() => {
    if (!activeTeamId || !db) { setTeamWorkspaces([]); setTeamMembers([]); return; }
    const wsRef = collection(db as Firestore, `teams/${activeTeamId}/workspaces`);
    const membersRef = collection(db as Firestore, `teams/${activeTeamId}/members`);

    const unsubWs = onSnapshot(wsRef, (snapshot) => {
      setTeamWorkspaces(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Workspace)));
    });
    const unsubMembers = onSnapshot(membersRef, (snapshot) => {
      setTeamMembers(snapshot.docs.map(d => ({ ...d.data() } as Member)));
    });
    return () => { unsubWs(); unsubMembers(); };
  }, [activeTeamId, db]);

  useEffect(() => {
    if (!user?.id || !db) { setPersonalWorkspaces([]); return; }
    const workspacesRef = collection(db as Firestore, `users/${user.id}/workspaces`);
    return onSnapshot(firestoreQuery(workspacesRef), (snapshot) => {
      const ws = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data()
      } as Workspace));
      setPersonalWorkspaces(ws);
      if (ws.length > 0 && !activeWorkspaceId && !hasAutoSelected.current) {
        const lastWsId = sessionStorage.getItem(`last_ws_${user.id}`);
        const targetId = (lastWsId && ws.find(w => w.id === lastWsId)) ? lastWsId : ws[0].id;
        setActiveWorkspaceId(targetId);
        hasAutoSelected.current = true;
      }
    });
  }, [user?.id, db, activeWorkspaceId]);

  useEffect(() => {
    if (!user?.id || !db || !activeWorkspaceId) { setNodes({}); return; }
    const currentWs = workspaces.find(w => w.id === activeWorkspaceId);
    if (!currentWs) return;
    const ownerId = currentWs.userId;
    const q = firestoreQuery(collection(db as Firestore, `users/${ownerId}/nodes`), where("workspaceId", "==", activeWorkspaceId));
    return onSnapshot(q, (snapshot) => {
      setNodes(prev => {
        const next = { ...prev };
        snapshot.docChanges().forEach(change => {
          if (change.type === 'removed') delete next[change.doc.id];
          else next[change.doc.id] = { id: change.doc.id, ...change.doc.data() } as FileNode;
        });
        return next;
      });
    });
  }, [user?.id, db, activeWorkspaceId, workspaces]);

  useEffect(() => {
    if (!user?.id || !db) return;
    const invitesRef = collection(db as Firestore, `users/${user.id}/invites`);
    return onSnapshot(invitesRef, (snapshot) => {
      setInvites(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as TeamInvite)));
    });
  }, [user?.id, db]);

  const contextValue = useMemo(() => ({
    workspaces, activeWorkspaceId, nodes, activeFileId, openFileIds, teams, activeTeamId, teamMembers, isTeamOwner, isTeamMember, invites, allUsers, selectedServerId,
    createWorkspace, deleteWorkspace, setActiveWorkspace: (id: string | null) => { setActiveWorkspaceId(id); if (user?.id && id) sessionStorage.setItem(`last_ws_${user.id}`, id); },
    renameWorkspace, assignWorkspaceToTeam, unassignWorkspaceFromTeam, addCollaborator, kickMember, transferOwnership, createNode, deleteNode, updateNode, renameNode,
    moveNode, moveNodeToWorkspace, openFile, closeFile, setActiveFile: setActiveFileId, downloadWorkspace, downloadNode, uploadToFolder, importWorkspace,
    getNodePath, createTeam, deleteTeam, setActiveTeam: (id: string | null) => setActiveTeamId(id), updateTeamApiKey,
    sendTeamInvite, acceptInvite, rejectInvite, setSelectedServer
  }), [workspaces, activeWorkspaceId, nodes, activeFileId, openFileIds, teams, activeTeamId, teamMembers, isTeamOwner, isTeamMember, invites, allUsers, selectedServerId, createWorkspace, deleteWorkspace, renameWorkspace, assignWorkspaceToTeam, unassignWorkspaceFromTeam, addCollaborator, kickMember, transferOwnership, createNode, deleteNode, updateNode, renameNode, moveNode, moveNodeToWorkspace, openFile, closeFile, downloadWorkspace, downloadNode, uploadToFolder, importWorkspace, getNodePath, createTeam, deleteTeam, updateTeamApiKey, sendTeamInvite, acceptInvite, rejectInvite, setSelectedServer, user?.id]);

  return <FileContext.Provider value={contextValue}>{children}</FileContext.Provider>;
};

export const useFiles = () => {
  const context = useContext(FileContext);
  if (!context) throw new Error('useFiles must be used within FileProvider');
  return context;
};
