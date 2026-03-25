'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore,
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager 
} from 'firebase/firestore';

/**
 * Initializes Firebase services correctly, ensuring initializeFirestore is only called once.
 * This singleton pattern prevents errors during hot-reloading or hydration.
 */
export function initializeFirebase() {
  let firebaseApp: FirebaseApp;

  if (!getApps().length) {
    try {
      // Try automatic environment initialization first
      firebaseApp = initializeApp();
    } catch (e) {
      // Fallback to static configuration
      firebaseApp = initializeApp(firebaseConfig);
    }

    // Modern SDKs: initializeFirestore must be called BEFORE getFirestore.
    // We only do this once during the initial application setup.
    initializeFirestore(firebaseApp, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
      experimentalAutoDetectLongPolling: true, // Essential for high-latency regions
    });
  } else {
    firebaseApp = getApp();
  }

  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp),
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
