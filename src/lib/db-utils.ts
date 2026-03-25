import { 
  collection, 
  doc, 
  getDocs, 
  writeBatch, 
  Firestore 
} from 'firebase/firestore';

/**
 * Recursively wipes all data associated with a user UID from Firestore.
 * This includes nodes, workspaces, keys, and the user profile document itself.
 */
export const wipeAllUserData = async (db: Firestore, userId: string) => {
  const batch = writeBatch(db);
  
  // 1. Wipe Nodes (Files/Folders)
  const nodesRef = collection(db, `users/${userId}/nodes`);
  const nodesSnap = await getDocs(nodesRef);
  nodesSnap.docs.forEach(d => batch.delete(d.ref));

  // 2. Wipe Workspaces
  const wsRef = collection(db, `users/${userId}/workspaces`);
  const wsSnap = await getDocs(wsRef);
  wsSnap.docs.forEach(d => batch.delete(d.ref));

  // 3. Wipe API Keys
  const keysRef = collection(db, `users/${userId}/keys`);
  const keysSnap = await getDocs(keysRef);
  keysSnap.docs.forEach(d => batch.delete(d.ref));

  // 4. Wipe Invites
  const invitesRef = collection(db, `users/${userId}/invites`);
  const invitesSnap = await getDocs(invitesRef);
  invitesSnap.docs.forEach(d => batch.delete(d.ref));

  // 5. Wipe User Profile Document
  const userDocRef = doc(db, `users`, userId);
  batch.delete(userDocRef);

  // Execute the batch deletion
  await batch.commit();
};
