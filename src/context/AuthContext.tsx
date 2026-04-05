'use client';

import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { UserSession } from '@/lib/types';
import { 
  signInWithPopup,
  signInAnonymously,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  deleteUser
} from 'firebase/auth';
import { useFirebase } from '@/firebase';
import { toast } from '@/hooks/use-toast';
import { wipeAllUserData } from '@/lib/db-utils';
import { Firestore, doc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';

interface AuthContextType {
  user: UserSession | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: () => Promise<void>;
  updateUsername: (newName: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { auth, firestore: db, user: firebaseUser, isUserLoading } = useFirebase();
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Derive the UserSession from the Firebase User object
  const user = useMemo(() => {
    if (!firebaseUser) return null;
    
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      username: firebaseUser.displayName || (firebaseUser.isAnonymous ? 'Guest Developer' : 'Developer'),
      photoURL: firebaseUser.photoURL || null,
      isAnonymous: firebaseUser.isAnonymous
    };
  }, [firebaseUser]);

  // Sync user data to Firestore in a separate effect
  useEffect(() => {
    if (user && db) {
      const userRef = doc(db as Firestore, 'users', user.id);
      setDocumentNonBlocking(userRef, user, { merge: true });
    }
  }, [user, db]);

  const signInWithGoogle = async () => {
    if (!auth) return;
    setIsActionLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast({ title: "Signed In", description: "Successfully authenticated via Google." });
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user') {
        toast({ title: "Sign In Failed", description: error.message, variant: "destructive" });
      }
    } finally {
      setIsActionLoading(false);
    }
  };

  const signInAsGuest = async () => {
    if (!auth) return;
    setIsActionLoading(true);
    try {
      await signInAnonymously(auth);
      toast({ title: "Guest Session Active", description: "Volatile workspace created." });
    } catch (error: any) {
      toast({ title: "Guest Access Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsActionLoading(false);
    }
  };

  const updateUsername = async (newName: string) => {
    if (!auth?.currentUser || !db) return;
    try {
      await updateProfile(auth.currentUser, { displayName: newName });
      const userRef = doc(db as Firestore, 'users', auth.currentUser.uid);
      setDocumentNonBlocking(userRef, { username: newName }, { merge: true });
      toast({ title: "Profile Updated" });
    } catch (error: any) {
      toast({ title: "Update Failed", description: error.message, variant: "destructive" });
    }
  };

  const logout = async () => {
    if (!auth || !db) return;
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const isAnonymous = currentUser.isAnonymous;
    const uid = currentUser.uid;

    try {
      if (isAnonymous) {
        await wipeAllUserData(db as Firestore, uid);
        await deleteUser(currentUser);
      } else {
        await signOut(auth);
      }
      toast({ title: "Session Terminated" });
    } catch (error: any) {
      await signOut(auth);
      toast({ title: "Signed Out" });
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading: isUserLoading || isActionLoading, 
      signInWithGoogle, 
      signInAsGuest, 
      updateUsername, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
