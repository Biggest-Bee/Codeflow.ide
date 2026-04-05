
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("ARCHITECTURAL_FAILURE:", error);
  }, [error]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background p-6 text-center">
      <div className="relative mb-8">
        <AlertCircle size={64} className="text-destructive opacity-20 animate-pulse" />
        <div className="absolute inset-0 flex items-center justify-center">
          <AlertCircle size={32} className="text-destructive" />
        </div>
      </div>

      <h1 className="text-2xl font-black uppercase tracking-tighter text-foreground mb-2">
        System Kernel Error
      </h1>
      
      <p className="text-[10px] text-muted-foreground uppercase tracking-widest max-w-md mb-8 leading-relaxed">
        The application encountered a critical runtime exception. This usually indicates a dependency resolution conflict or an invalid environment configuration.
      </p>

      {error.message && (
        <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-md mb-8 max-w-xl w-full">
          <p className="font-code text-[11px] text-destructive text-left break-all whitespace-pre-wrap">
            {error.message}
          </p>
          {error.digest && (
            <p className="text-[8px] text-destructive/50 mt-2 text-left uppercase font-bold tracking-widest">
              ID: {error.digest}
            </p>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <Button 
          variant="default" 
          onClick={() => reset()}
          className="gap-2 font-black uppercase tracking-widest text-[10px] px-6 h-10 shadow-lg shadow-primary/20"
        >
          <RotateCcw size={14} /> Rebuild Session
        </Button>
        <Link href="/">
          <Button 
            variant="outline" 
            className="gap-2 font-black uppercase tracking-widest text-[10px] px-6 h-10 border-white/10"
          >
            <Home size={14} /> Recovery Hub
          </Button>
        </Link>
      </div>
      
      <p className="mt-12 text-[8px] text-muted-foreground/30 uppercase font-black tracking-[0.4em]">
        Frostvale Studio • Kernel v2.0
      </p>
    </div>
  );
}
