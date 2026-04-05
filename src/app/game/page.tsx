
'use client';

import { VoxelWorld } from '@/components/game/VoxelWorld';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Crosshair, Zap } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function GamePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="h-screen w-full relative overflow-hidden bg-background">
      {/* Header UI */}
      <div className="absolute top-4 right-4 z-[100] flex gap-2">
        <div className="bg-background/50 border border-white/10 backdrop-blur-sm px-3 py-1.5 rounded-md flex items-center gap-2">
          <Zap size={12} className="text-primary animate-pulse" />
          <span className="text-[9px] font-black uppercase tracking-widest text-foreground/80">Neural Engine Active</span>
        </div>
        <Link href="/">
          <Button variant="outline" size="sm" className="gap-2 bg-background/50 border-white/10 backdrop-blur-sm text-[10px] font-black uppercase tracking-widest h-8">
            <ChevronLeft size={14} /> Exit to IDE
          </Button>
        </Link>
      </div>

      {/* Crosshair / Scope Overlay (Managed in VoxelWorld for logic, but can have global styles here) */}
      <style jsx global>{`
        body { cursor: crosshair; }
      `}</style>
      
      <VoxelWorld />
    </div>
  );
}
