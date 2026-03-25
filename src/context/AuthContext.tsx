
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserSession } from '@/lib/types';
import { 
  onAuthStateChanged, 
  signInWithPopup,
  signInAnonymously,
  GoogleAuthProvider,
  signOut,
  User,
  updateProfile,
  setPersistence,
  inMemoryPersistence,
  deleteUser
} from 'firebase/auth';
import { useFirebase } from '@/firebase';
import { toast } from '@/hooks/use-toast';
import { wipeAllUserData } from '@/lib/db-utils';
import { Firestore, doc, setDoc } from 'firebase/firestore';

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
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { auth, firestore: db } = useFirebase();

  useEffect(() => {
    if (!auth) {
      setIsLoading(false);
      return;
    }

    // High-security isolation: Each tab gets its own auth state.
    // This allows multiple CodeFlow instances to run with different accounts in the same browser.
    const setupAuth = async () => {
      try {
        await setPersistence(auth, inMemoryPersistence);
      } catch (error) {
        console.error("Auth persistence error:", error);
      }

      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
        if (firebaseUser) {
          const userData: UserSession = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            username: firebaseUser.isAnonymous ? (firebaseUser.displayName || 'Guest Developer') : (firebaseUser.displayName || 'Developer'),
            photoURL: firebaseUser.photoURL || null,
            isAnonymous: firebaseUser.isAnonymous
          };
          setUser(userData);
          
          if (db) {
            const userRef = doc(db as Firestore, 'users', firebaseUser.uid);
            await setDoc(userRef, userData, { merge: true });
          }
        } else {
          setUser(null);
        }
        setIsLoading(false);
      });

      return unsubscribe;
    };

    const unsubPromise = setupAuth();
    return () => { unsubPromise.then(unsub => unsub?.()); };
  }, [auth, db]);

  const signInWithGoogle = async () => {
    if (!auth) return;
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast({ title: "Signed In", description: "Successfully authenticated via Google." });
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user') {
        toast({ title: "Sign In Failed", description: error.message, variant: "destructive" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signInAsGuest = async () => {
    if (!auth) return;
    setIsLoading(true);
    try {
      await signInAnonymously(auth);
      toast({ title: "Guest Session Active", description: "Volatile workspace created." });
    } catch (error: any) {
      toast({ title: "Guest Access Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const updateUsername = async (newName: string) => {
    if (!auth?.currentUser || !db) return;
    try {
      await updateProfile(auth.currentUser, { displayName: newName });
      const updatedUser = user ? { ...user, username: newName } : null;
      if (updatedUser) setUser(updatedUser);
      const userRef = doc(db as Firestore, 'users', auth.currentUser.uid);
      await setDoc(userRef, { username: newName }, { merge: true });
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
        toast({ title: "Guest Session Wiped" });
      } else {
        await signOut(auth);
        toast({ title: "Signed Out" });
      }
    } catch (error: any) {
      await signOut(auth);
      toast({ title: "Signed Out", variant: "destructive" });
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signInWithGoogle, signInAsGuest, updateUsername, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
