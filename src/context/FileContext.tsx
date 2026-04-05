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
  deleteDoc,
  arrayRemove,
  limit,
  getDocs,
  getDoc
} from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { useFirebase } from '@/firebase';
import { v4 as uuidv4 } from 'uuid';
import { setDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { toast } from '@/hooks/use-toast';
import JSZip from 'jszip';

interface FileContextType {
  workspaces: Workspace[];
  personalWorkspaces: Workspace[];
  teamWorkspaces: Workspace[];
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

  createWorkspace: (name: string, teamId?: string) => Promise<string>;
  deleteWorkspace: (id: string) => Promise<void>;
  setActiveWorkspace: (id: string | null) => void;
  renameWorkspace: (id: string, name: string) => void;
  assignWorkspaceToTeam: (wsId: string, teamId: string) => Promise<void>;
  unassignWorkspaceFromTeam: (wsId: string, teamId: string) => Promise<void>;
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
  renameTeam: (teamId: string, name: string) => Promise<void>;
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

  const saveTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({});
  const initialSelectionDone = useRef(false);

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
    const team = teams.find(t => t.id === activeTeamId);
    return team?.ownerId === user.id || team?.memberIds?.includes(user.id) || false;
  }, [activeTeamId, user, teams]);

  const createWorkspace = useCallback(async (name: string, teamId?: string) => {
    if (!user || !db) return '';

    if (!teamId && personalWorkspaces.length >= 10) {
      toast({ 
        title: "Capacity Reached", 
        description: "Maximum of 10 personal workspaces allowed.",
        variant: "destructive"
      });
      return '';
    }

    const id = uuidv4();
    const targetTeamId = teamId || null;
    
    const ws: Workspace = {
      id,
      name,
      userId: user.id,
      rootFileIds: [],
      createdAt: Date.now(),
      collaboratorIds: [],
      collaborators: [],
      ...(targetTeamId ? { teamId: targetTeamId } : {})
    };
    
    const path = targetTeamId 
      ? `teams/${targetTeamId}/workspaces` 
      : `users/${user.id}/workspaces`;
      
    await setDoc(doc(db as Firestore, path, id), ws);
    setActiveWorkspaceId(id);
    return id;
  }, [user, db, personalWorkspaces]);

  const deleteWorkspace = useCallback(async (id: string) => {
    if (!user || !db) return;
    const ws = workspaces.find(w => w.id === id);
    if (!ws) return;
    
    if (ws.teamId) {
      toast({ title: "Action Required", description: "Unlink workspace from team before deleting.", variant: "destructive" });
      return;
    }

    const path = `users/${user.id}/workspaces`;
    await deleteDoc(doc(db as Firestore, path, id));
    if (activeWorkspaceId === id) setActiveWorkspaceId(null);
  }, [user, db, workspaces, activeWorkspaceId]);

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

    batch.set(newWsRef, { ...ws, teamId, collaboratorIds: [], collaborators: [] });
    batch.delete(oldWsRef);

    const nodesRef = collection(db as Firestore, `users/${user.id}/nodes`);
    const nodesSnap = await getDocs(firestoreQuery(nodesRef, where("workspaceId", "==", wsId)));
    nodesSnap.docs.forEach(d => batch.update(d.ref, { teamId }));

    await batch.commit();
    toast({ title: "Workspace Assigned" });
  }, [db, user, personalWorkspaces]);

  const unassignWorkspaceFromTeam = useCallback(async (wsId: string, teamId: string) => {
    if (!db || !user) return;
    const ws = teamWorkspaces.find(w => w.id === wsId);
    if (!ws) return;

    const batch = writeBatch(db as Firestore);
    const newWsRef = doc(db as Firestore, `users/${ws.userId}/workspaces`, wsId);
    const oldWsRef = doc(db as Firestore, `teams/${teamId}/workspaces`, wsId);

    batch.set(newWsRef, { ...ws, updatedAt: Date.now(), teamId: null });
    batch.delete(oldWsRef);

    const nodesRef = collection(db as Firestore, `users/${ws.userId}/nodes`);
    const nodesSnap = await getDocs(firestoreQuery(nodesRef, where("workspaceId", "==", wsId)));
    nodesSnap.forEach(d => batch.update(d.ref, { teamId: null }));

    await batch.commit();
    toast({ title: "Workspace Reverted" });
  }, [db, user, teamWorkspaces]);

  const kickMember = useCallback(async (teamId: string, userId: string) => {
    if (!db) return;
    const batch = writeBatch(db as Firestore);
    batch.delete(doc(db as Firestore, `teams/${teamId}/members`, userId));
    batch.update(doc(db as Firestore, `teams/${teamId}`), { memberIds: arrayRemove(userId) });
    await batch.commit();
    
    if (user?.id === userId) {
      setActiveTeamId(null);
      if (user?.id) sessionStorage.removeItem(`last_team_${user.id}`);
      toast({ title: "Left Team" });
    } else {
      toast({ title: "Member Removed" });
    }
  }, [db, user?.id]);

  const transferOwnership = useCallback(async (teamId: string, newOwnerId: string) => {
    if (!db || !user) return;
    const team = teams.find(t => t.id === teamId);
    if (!team || team.ownerId !== user.id) return;
    updateDocumentNonBlocking(doc(db as Firestore, 'teams', teamId), { ownerId: newOwnerId });
  }, [db, user, teams]);

  const createNode = useCallback((parentId: string | null, name: string, type: FileType, language?: string, content = '') => {
    if (!user || !db || !activeWorkspaceId) return '';
    const currentWs = workspaces.find(w => w.id === activeWorkspaceId);
    if (!currentWs) return '';
    const id = uuidv4();
    const ownerId = currentWs.userId;
    const teamId = currentWs.teamId || null; 
    
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
    if (!node || !db) return;
    
    const finalUpdates = { ...updates };
    if (updates.name && node.type === 'file') {
      finalUpdates.language = getLanguageFromFileName(updates.name);
    }
    
    setNodes(prev => {
      const existing = prev[id];
      if (!existing) return prev;
      return { ...prev, [id]: { ...existing, ...finalUpdates } as FileNode };
    });

    if (saveTimeoutRef.current[id]) clearTimeout(saveTimeoutRef.current[id]);
    saveTimeoutRef.current[id] = setTimeout(() => {
      updateDocumentNonBlocking(doc(db as Firestore, `users/${node.ownerId}/nodes`, id), { ...finalUpdates, updatedAt: Date.now() });
    }, 500); 
  }, [db, nodes]);

  const deleteNode = useCallback(async (id: string) => {
    if (!db || !user) return;
    const node = nodes[id];
    if (!node) return;
    const ownerId = node.ownerId;
    
    const deleteRecursive = (nodeId: string) => {
      const n = nodes[nodeId];
      if (!n) return;
      deleteDocumentNonBlocking(doc(db as Firestore, `users/${ownerId}/nodes`, nodeId));
      n.children?.forEach(deleteRecursive);
    };
    
    deleteRecursive(id);
    if (node.parentId) {
      updateDocumentNonBlocking(doc(db as Firestore, `users/${ownerId}/nodes`, node.parentId), { children: arrayRemove(id) });
    } else {
      const ws = workspaces.find(w => w.id === node.workspaceId);
      if (ws) {
        const wsPath = ws.teamId ? `teams/${ws.teamId}/workspaces` : `users/${ownerId}/workspaces`;
        updateDocumentNonBlocking(doc(db as Firestore, wsPath, node.workspaceId), { rootFileIds: arrayRemove(id) });
      }
    }
  }, [db, user, nodes, workspaces]);

  const renameNode = useCallback((id: string, name: string) => {
    updateNode(id, { name });
  }, [updateNode]);

  const moveNode = useCallback(async (id: string, pid: string | null) => {
    if (!db || !user) return;
    const node = nodes[id];
    const ws = workspaces.find(w => w.id === node.workspaceId);
    if (!ws) return;

    const wsPath = ws.teamId ? `teams/${ws.teamId}/workspaces` : `users/${node.ownerId}/workspaces`;

    if (node.parentId) {
      updateDocumentNonBlocking(doc(db as Firestore, `users/${node.ownerId}/nodes`, node.parentId), { children: arrayRemove(id) });
    } else {
      updateDocumentNonBlocking(doc(db as Firestore, wsPath, node.workspaceId), { rootFileIds: arrayRemove(id) });
    }
    
    if (pid) {
      updateDocumentNonBlocking(doc(db as Firestore, `users/${node.ownerId}/nodes`, pid), { children: arrayUnion(id) });
    } else {
      updateDocumentNonBlocking(doc(db as Firestore, wsPath, node.workspaceId), { rootFileIds: arrayUnion(id) });
    }
    
    updateDocumentNonBlocking(doc(db as Firestore, `users/${node.ownerId}/nodes`, id), { parentId: pid });
  }, [db, user, nodes, workspaces]);

  const moveNodeToWorkspace = useCallback(async (id: string, twid: string) => {
    if (!db || !user) return;
    const node = nodes[id];
    const tws = workspaces.find(w => w.id === twid);
    if (!tws) return;
    
    updateDocumentNonBlocking(doc(db as Firestore, `users/${node.ownerId}/nodes`, id), { 
      workspaceId: twid, 
      teamId: tws.teamId || null, 
      ownerId: tws.userId, 
      parentId: null 
    });
    
    const wsPath = tws.teamId ? `teams/${tws.teamId}/workspaces` : `users/${tws.userId}/workspaces`;
    updateDocumentNonBlocking(doc(db as Firestore, wsPath, twid), { rootFileIds: arrayUnion(id) });
  }, [db, user, nodes, workspaces]);

  const createTeam = useCallback(async (name: string) => {
    if (!user || !db || user.isAnonymous) return;
    const id = uuidv4();
    const batch = writeBatch(db as Firestore);
    
    batch.set(doc(db as Firestore, 'teams', id), { 
      id, 
      name, 
      ownerId: user.id, 
      memberIds: [user.id], 
      createdAt: Date.now() 
    });
    
    batch.set(doc(db as Firestore, `teams/${id}/members`, user.id), { 
      userId: user.id, 
      username: user.username, 
      email: user.email, 
      joinedAt: Date.now() 
    });
    
    await batch.commit();
    setActiveTeamId(id);
    if (user?.id) sessionStorage.setItem(`last_team_${user.id}`, id);
    toast({ title: "Team Created" });
  }, [user, db]);

  const renameTeam = useCallback(async (teamId: string, name: string) => {
    if (db) updateDocumentNonBlocking(doc(db as Firestore, 'teams', teamId), { name });
  }, [db]);

  const deleteTeam = useCallback(async (teamId: string) => {
    if (!db || !user) return;
    console.log("=== STARTING ATOMIC TEAM DISBAND (BOTTOM-UP) ===");

    const retryOperation = async (operation: () => Promise<any>, maxRetries: number = 3, delay: number = 1000) => {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          return await operation();
        } catch (error: any) {
          if (error.name === 'BloomFilterError' && attempt < maxRetries) {
            console.warn(`BloomFilterError on attempt ${attempt}, retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2; // Exponential backoff
          } else {
            throw error;
          }
        }
      }
    };

    try {
      // PHASE 1: UNLINK NODES (Chunked to prevent BloomFilterError)
      console.log("Phase 1: Unlinking shared files...");
      const membersSnap = await getDocs(collection(db as Firestore, "teams", teamId, "members"));
      const mIds = membersSnap.docs.map(d => d.id);

      for (const mId of mIds) {
        let hasMoreNodes = true;
        while (hasMoreNodes) {
          const nodesQuery = firestoreQuery(
            collection(db as Firestore, `users/${mId}/nodes`), 
            where("teamId", "==", teamId), 
            limit(10) // Reduced from 50 to 10
          );
          const nodesSnap = await getDocs(nodesQuery);
          if (nodesSnap.empty) { hasMoreNodes = false; break; }

          const nodeBatch = writeBatch(db as Firestore);
          nodesSnap.forEach(d => nodeBatch.update(d.ref, { teamId: null, updatedAt: Date.now() }));
          await retryOperation(() => nodeBatch.commit());
          console.log(`...Processed ${nodesSnap.size} nodes for member ${mId}`);
          
          // Add delay to prevent overwhelming Firestore
          await new Promise(resolve => setTimeout(resolve, 200)); // Increased delay
        }
      }

      // PHASE 2: MIGRATE WORKSPACES (Chunked)
      console.log("Phase 2: Migrating shared workspaces...");
      const teamWsRef = collection(db as Firestore, `teams/${teamId}/workspaces`);
      const teamWsSnap = await getDocs(teamWsRef);
      const wsDocs = teamWsSnap.docs;
      
      for (let i = 0; i < wsDocs.length; i += 10) { // Reduced from 50 to 10
        const wsBatch = writeBatch(db as Firestore);
        const chunk = wsDocs.slice(i, i + 10);
        chunk.forEach(wsDoc => {
          const wsData = wsDoc.data() as Workspace;
          const newWsRef = doc(db as Firestore, `users/${wsData.userId}/workspaces`, wsDoc.id);
          wsBatch.set(newWsRef, { ...wsData, teamId: null, updatedAt: Date.now() });
          wsBatch.delete(wsDoc.ref);
        });
        await retryOperation(() => wsBatch.commit());
        console.log(`...Migrated ${chunk.length} workspaces`);
        
        // Add delay to prevent overwhelming Firestore
        await new Promise(resolve => setTimeout(resolve, 200)); // Increased delay
      }

      // PHASES 3, 4, 5: ATOMIC FINAL CLEANUP (Chunked to prevent BloomFilterError)
      console.log("Phases 3, 4 & 5: Executing Atomic Registry Cleanup...");

      // Delete global invites (chunked)
      const invitesRef = collection(db as Firestore, 'invites');
      const inviteSnap = await getDocs(firestoreQuery(invitesRef, where("teamId", "==", teamId)));
      for (let i = 0; i < inviteSnap.docs.length; i += 5) { // Reduced from 20 to 5
        const inviteBatch = writeBatch(db as Firestore);
        const chunk = inviteSnap.docs.slice(i, i + 5);
        chunk.forEach(d => inviteBatch.delete(d.ref));
        await retryOperation(() => inviteBatch.commit());
        console.log(`...Deleted ${chunk.length} global invites`);
        
        // Add delay to prevent overwhelming Firestore
        await new Promise(resolve => setTimeout(resolve, 200)); // Increased delay
      }

      // Delete team invitations (chunked)
      const teamInvitesRef = collection(db as Firestore, `teams/${teamId}/invitations`);
      const teamInviteSnap = await getDocs(teamInvitesRef);
      for (let i = 0; i < teamInviteSnap.docs.length; i += 5) { // Reduced from 20 to 5
        const teamInviteBatch = writeBatch(db as Firestore);
        const chunk = teamInviteSnap.docs.slice(i, i + 5);
        chunk.forEach(d => teamInviteBatch.delete(d.ref));
        await retryOperation(() => teamInviteBatch.commit());
        console.log(`...Deleted ${chunk.length} team invitations`);
        
        // Add delay to prevent overwhelming Firestore
        await new Promise(resolve => setTimeout(resolve, 200)); // Increased delay
      }

      // Delete members (chunked)
      for (let i = 0; i < membersSnap.docs.length; i += 5) { // Reduced from 20 to 5
        const memberBatch = writeBatch(db as Firestore);
        const chunk = membersSnap.docs.slice(i, i + 5);
        chunk.forEach(m => memberBatch.delete(m.ref));
        await retryOperation(() => memberBatch.commit());
        console.log(`...Deleted ${chunk.length} members`);
        
        // Add delay to prevent overwhelming Firestore
        await new Promise(resolve => setTimeout(resolve, 200)); // Increased delay
      }

      // Finally delete the team document
      await retryOperation(() => deleteDoc(doc(db as Firestore, 'teams', teamId)));
      console.log("✅ TEAM DISBANDED SUCCESSFULLY");

      if (activeTeamId === teamId) {
        setActiveTeamId(null);
        if (user?.id) sessionStorage.removeItem(`last_team_${user.id}`);
      }
      toast({ title: "Team Disbanded", description: "All shared assets recovered." });

    } catch (e: any) {
      console.error("❌ DISBAND FAILED:", e);
      toast({ title: "Disband Failed", description: e.message, variant: "destructive" });
    }
  }, [db, user, activeTeamId]);

  const updateTeamApiKey = useCallback(async (teamId: string, apiKey: string) => {
    if (db) updateDocumentNonBlocking(doc(db as Firestore, 'teams', teamId), { teamApiKey: apiKey });
  }, [db]);

  const sendTeamInvite = useCallback(async (teamId: string, targetEmail: string) => {
    if (!db || !user) return;
    const usersRef = collection(db as Firestore, 'users');
    const q = firestoreQuery(usersRef, where("email", "==", targetEmail.trim()), limit(1));
    const snap = await getDocs(q);
    
    if (snap.empty) {
      toast({ title: "User not found", variant: "destructive" });
      return;
    }

    const targetUser = snap.docs[0].data() as UserSession;
    const inviteId = uuidv4();
    const team = teams.find(t => t.id === teamId);
    
    const inviteData = {
      id: inviteId, 
      teamId, 
      teamName: team?.name || "Team", 
      senderId: user.id, 
      senderName: user.username, 
      recipientId: targetUser.id, 
      recipientEmail: targetEmail.trim(), 
      createdAt: Date.now()
    };

    setDocumentNonBlocking(doc(db as Firestore, `invites`, inviteId), inviteData, { merge: true });
    toast({ title: "Invite Dispatched", description: `Sent to ${targetEmail}` });
  }, [db, user, teams]);

  const acceptInvite = useCallback(async (inviteId: string) => {
    if (!db || !user) return;
    const inviteRef = doc(db as Firestore, `invites`, inviteId);
    const inviteSnap = await getDoc(inviteRef);
    const inviteData = inviteSnap.data();
    if (!inviteData) return;

    const teamId = inviteData.teamId;
    const batch = writeBatch(db as Firestore);

    batch.set(doc(db as Firestore, `teams/${teamId}/members`, user.id), {
      userId: user.id, 
      username: user.username, 
      email: user.email, 
      joinedAt: Date.now()
    });

    batch.update(doc(db as Firestore, `teams/${teamId}`), { 
      memberIds: arrayUnion(user.id) 
    });

    batch.delete(inviteRef);
    
    await batch.commit();
    setActiveTeamId(teamId);
    if (user?.id) sessionStorage.setItem(`last_team_${user.id}`, teamId);
    toast({ title: "Joined Team" });
  }, [db, user]);

  const rejectInvite = useCallback(async (inviteId: string) => {
    if (!db || !user) return;
    deleteDocumentNonBlocking(doc(db as Firestore, `invites`, inviteId));
  }, [db, user]);

  const setSelectedServer = useCallback(async (serverId: string) => {
    setSelectedServerId(serverId);
    if (user?.id && db) {
      updateDocumentNonBlocking(doc(db as Firestore, 'users', user.id), { selectedServer: serverId });
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
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = n.name; a.click();
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
      id: wsId, name: file.name.replace('.zip', ''), userId: user.id, collaboratorIds: [], collaborators: [], rootFileIds: [], createdAt: Date.now(),
      ...(activeTeamId ? { teamId: activeTeamId } : {})
    });
    setActiveWorkspaceId(wsId);
  }, [user, db, activeTeamId]);

  useEffect(() => {
    if (user?.id) {
      const lastTeamId = sessionStorage.getItem(`last_team_${user.id}`);
      if (lastTeamId) setActiveTeamId(lastTeamId);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id && workspaces.length > 0 && !initialSelectionDone.current) {
      const lastWsId = sessionStorage.getItem(`last_ws_${user.id}`);
      const target = workspaces.find(w => w.id === lastWsId) || workspaces[0];
      if (target) {
        setActiveWorkspaceId(target.id);
        initialSelectionDone.current = true;
      }
    }
  }, [user?.id, workspaces]);

  useEffect(() => {
    if (!user?.id || !db) { setTeams([]); return; }
    const q = firestoreQuery(collection(db as Firestore, 'teams'), where("memberIds", "array-contains", user.id));
    return onSnapshot(q, snap => {
      const newTeams = snap.docs.map(d => ({ id: d.id, ...d.data() } as Team));
      setTeams(newTeams);
      if (activeTeamId && !newTeams.some(t => t.id === activeTeamId)) {
        setActiveTeamId(null);
        if (user?.id) sessionStorage.removeItem(`last_team_${user.id}`);
      }
    });
  }, [user?.id, db, activeTeamId]);

  useEffect(() => {
    if (!activeTeamId || !db) { setTeamWorkspaces([]); setTeamMembers([]); return; }
    const unsubWs = onSnapshot(collection(db as Firestore, `teams/${activeTeamId}/workspaces`), snap => 
      setTeamWorkspaces(snap.docs.map(d => ({ id: d.id, ...d.data() } as Workspace)))
    );
    const unsubMembers = onSnapshot(collection(db as Firestore, `teams/${activeTeamId}/members`), snap => 
      setTeamMembers(snap.docs.map(d => ({ ...d.data() } as Member)))
    );
    return () => { unsubWs(); unsubMembers(); };
  }, [activeTeamId, db]);

  useEffect(() => {
    if (!user?.id || !db) { setPersonalWorkspaces([]); return; }
    return onSnapshot(collection(db as Firestore, `users/${user.id}/workspaces`), snap => 
      setPersonalWorkspaces(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Workspace)))
    );
  }, [user?.id, db]);

  useEffect(() => {
    if (!user?.id || !db || !activeWorkspaceId) { setNodes({}); return; }
    
    const ws = workspaces.find(w => w.id === activeWorkspaceId);
    if (!ws) return;

    const nodesRef = collection(db as Firestore, `users/${ws.userId}/nodes`);
    let q;
    
    if (ws.teamId) {
      q = firestoreQuery(
        nodesRef, 
        where("workspaceId", "==", activeWorkspaceId),
        where("teamId", "==", ws.teamId)
      );
    } else {
      q = firestoreQuery(
        nodesRef, 
        where("workspaceId", "==", activeWorkspaceId)
      );
    }

    return onSnapshot(q, (snap) => {
      setNodes(prev => {
        const next = { ...prev };
        snap.docChanges().forEach(change => {
          if (change.type === 'removed') {
            delete next[change.doc.id];
          } else {
            next[change.doc.id] = { id: change.doc.id, ...change.doc.data() } as FileNode;
          }
        });
        return next;
      });
    }, (error) => {
      console.error("Nodes Sync Error:", error.message);
    });
  }, [user?.id, db, activeWorkspaceId, workspaces]);

  useEffect(() => {
    if (!user?.id || !db) return;
    const q = firestoreQuery(collection(db as Firestore, 'invites'), where("recipientId", "==", user.id));
    return onSnapshot(q, snap => 
      setInvites(snap.docs.map(d => ({ id: d.id, ...d.data() } as TeamInvite)))
    );
  }, [user?.id, db]);

  const contextValue = useMemo(() => ({
    workspaces, personalWorkspaces, teamWorkspaces, activeWorkspaceId, nodes, activeFileId, openFileIds, teams, activeTeamId, teamMembers, isTeamOwner, isTeamMember, invites, allUsers, selectedServerId,
    createWorkspace, deleteWorkspace, setActiveWorkspace: (id: string | null) => { 
      setActiveWorkspaceId(id); 
      if (user?.id && id) {
        sessionStorage.setItem(`last_ws_${user.id}`, id);
        const ws = [...personalWorkspaces, ...teamWorkspaces].find(w => w.id === id);
        if (ws?.teamId) {
          setActiveTeamId(ws.teamId);
          sessionStorage.setItem(`last_team_${user.id}`, ws.teamId);
        }
      }
    },
    renameWorkspace, assignWorkspaceToTeam, unassignWorkspaceFromTeam, kickMember, transferOwnership, createNode, deleteNode, updateNode, renameNode,
    moveNode, moveNodeToWorkspace, openFile, closeFile, setActiveFile: setActiveFileId, downloadWorkspace, downloadNode, uploadToFolder, importWorkspace,
    getNodePath, createTeam, renameTeam, deleteTeam, setActiveTeam: (id: string | null) => {
      setActiveTeamId(id);
      if (user?.id) {
        if (id) sessionStorage.setItem(`last_team_${user.id}`, id);
        else sessionStorage.removeItem(`last_team_${user.id}`);
      }
    }, updateTeamApiKey,
    sendTeamInvite, acceptInvite, rejectInvite, setSelectedServer
  }), [workspaces, personalWorkspaces, teamWorkspaces, activeWorkspaceId, nodes, activeFileId, openFileIds, teams, activeTeamId, teamMembers, isTeamOwner, isTeamMember, invites, allUsers, selectedServerId, user?.id]);

  return <FileContext.Provider value={contextValue}>{children}</FileContext.Provider>;
};

export const useFiles = () => {
  const context = useContext(FileContext);
  if (!context) throw new Error('useFiles must be used within FileProvider');
  return context;
};
