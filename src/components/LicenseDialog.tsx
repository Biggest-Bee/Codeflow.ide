'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Scale, FileText, Info, ShieldCheck, Heart, Github } from 'lucide-react';

interface LicenseDialogProps {
  trigger: React.ReactNode;
}

export const LicenseDialog: React.FC<LicenseDialogProps> = ({ trigger }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-sidebar border-border">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
              <Scale className="text-primary h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-sm font-black uppercase tracking-[0.2em] text-primary">
                Apache License 2.0
              </DialogTitle>
              <DialogDescription className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mt-1">
                Copyright © 2026 Frostvale Studio • Open Source
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <ScrollArea className="h-[400px] mt-4 rounded-md border border-white/5 bg-background/50 p-6">
          <div className="prose prose-invert prose-sm max-w-none font-body text-muted-foreground">
            <h1 className="text-foreground text-lg font-bold mb-4 flex items-center gap-2">
              <FileText size={18} className="text-primary" /> Apache License, Version 2.0
            </h1>
            
            <section className="mb-6">
              <h2 className="text-foreground text-xs font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                <ShieldCheck size={12} className="text-primary" /> 1. Grant of Rights
              </h2>
              <p className="text-[11px] leading-relaxed">
                Subject to the terms and conditions of this License, each Contributor hereby grants to You a perpetual, worldwide, non-exclusive, no-charge, royalty-free, irrevocable copyright license to reproduce, prepare Derivative Works of, publicly display, publicly perform, sublicense, and distribute the Work and such Derivative Works in Source or Object form.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-foreground text-xs font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                <Heart size={12} className="text-primary" /> 2. Grant of Patent License
              </h2>
              <p className="text-[11px] leading-relaxed">
                Each Contributor grants to You a perpetual, worldwide, non-exclusive, no-charge, royalty-free, irrevocable patent license to make, have made, use, offer to sell, sell, import, and otherwise transfer the Work.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-foreground text-xs font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                <Info size={12} className="text-primary" /> 3. Redistribution
              </h2>
              <p className="text-[11px] leading-relaxed">
                You may reproduce and distribute copies of the Work or Derivative Works thereof in any medium, with or without modifications, and in Source or Object form, provided that You give any other recipients of the Work or Derivative Works a copy of this License.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-foreground text-xs font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" /> 4. No Warranty
              </h2>
              <p className="text-[10px] leading-relaxed italic opacity-70">
                Unless required by applicable law or agreed to in writing, Licensor provides the Work (and each Contributor provides its Contributions) on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
              </p>
            </section>

            <div className="p-4 rounded border border-primary/20 bg-primary/5 mt-8">
              <p className="text-[10px] font-bold text-primary uppercase text-center flex items-center justify-center gap-2">
                <Github size={12} /> This software is now available for open-source contribution and commercial use under Apache 2.0.
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};