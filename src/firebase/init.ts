'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

/**
 * Singleton pattern for Firebase services.
 * Ensures consistent instances across the application and handles server-side safety.
 */
export function getFirebaseServices() {
  if (typeof window === 'undefined') {
    return { firebaseApp: null as any, auth: null as any, firestore: null as any };
  }

  if (!app) {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    // Configure auth to reduce cookie partitioning warnings
    auth.setPersistence(browserLocalPersistence);
    db = getFirestore(app);
  }

  return {
    firebaseApp: app,
    auth,
    firestore: db,
  };
}

/**
 * @deprecated Use getFirebaseServices() for stable singleton instances.
 */
export function initializeFirebase() {
  return getFirebaseServices();
}
