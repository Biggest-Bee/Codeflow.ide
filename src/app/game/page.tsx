
'use client';

import { VoxelWorld } from '@/components/game/VoxelWorld';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function GamePage() {
  return (
    <div className="h-screen w-full relative overflow-hidden bg-background">
      <div className="absolute top-4 right-4 z-[100]">
        <Link href="/">
          <Button variant="outline" size="sm" className="gap-2 bg-background/50 border-white/10 backdrop-blur-sm">
            <ChevronLeft size={14} /> Exit to IDE
          </Button>
        </Link>
      </div>
      
      <VoxelWorld />
    </div>
  );
}
