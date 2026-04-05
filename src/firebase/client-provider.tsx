'use client';

import React, { useState, useEffect, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { getFirebaseServices } from '@/firebase/init';
import { Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const [services, setServices] = useState<{
    firebaseApp: any;
    auth: any;
    firestore: any;
  } | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    try {
      // Initialize services only once on the client
      const initialized = getFirebaseServices();
      if (mounted) {
        setServices(initialized);
      }
    } catch (err: any) {
      console.error("Firebase Service Failure:", err);
      if (mounted) {
        setError(err);
      }
    }

    return () => { mounted = false; };
  }, []);

  if (error) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background text-center p-6">
        <AlertCircle className="text-destructive h-12 w-12 mb-4 opacity-50" />
        <h1 className="text-xl font-black uppercase tracking-tighter text-foreground mb-2">Service Error</h1>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest max-w-xs mb-6 leading-relaxed">
          The core architecture services failed to initialize. Please verify your network and environment configs.
        </p>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="font-black uppercase tracking-widest text-[9px] border-primary/20">
          Reboot System
        </Button>
      </div>
    );
  }

  if (!services || !services.firebaseApp) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background">
        <div className="relative h-12 w-12 flex items-center justify-center mb-6">
          <Sparkles className="text-primary h-8 w-8 animate-pulse" />
          <div className="absolute inset-0 border-2 border-primary/20 rounded-full animate-ping" />
        </div>
        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-primary animate-pulse">
          Booting Services
        </span>
      </div>
    );
  }

  return (
    <FirebaseProvider
      firebaseApp={services.firebaseApp}
      auth={services.auth}
      firestore={services.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
