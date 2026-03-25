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
import { ShieldAlert, FileText, Scale, UserCheck, Ban, Info } from 'lucide-react';

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
              <ShieldAlert className="text-primary h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-sm font-black uppercase tracking-[0.2em] text-primary">
                Proprietary Source License
              </DialogTitle>
              <DialogDescription className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mt-1">
                Copyright © 2026 Frostvale Studio • All Rights Reserved
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <ScrollArea className="h-[400px] mt-4 rounded-md border border-white/5 bg-background/50 p-6">
          <div className="prose prose-invert prose-sm max-w-none font-body text-muted-foreground">
            <h1 className="text-foreground text-lg font-bold mb-4 flex items-center gap-2">
              <FileText size={18} className="text-primary" /> Frostvale Studio License (2026)
            </h1>
            
            <section className="mb-6">
              <h2 className="text-foreground text-xs font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                <UserCheck size={12} className="text-primary" /> 1. Permitted Use
              </h2>
              <ul className="text-[11px] space-y-1 list-disc pl-4">
                <li>Access is granted to **individuals only**; organizations or companies are excluded.</li>
                <li>Viewing is strictly limited to the version publicly available at the time of access.</li>
                <li>Rights are limited to personal, non-commercial evaluation and study.</li>
              </ul>
            </section>

            <section className="mb-6">
              <h2 className="text-destructive text-xs font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                <Ban size={12} className="text-destructive" /> 2. Prohibited Acts
              </h2>
              <ul className="text-[11px] space-y-2 list-disc pl-4">
                <li>NO Commercial Use: Use for any for-profit purpose is strictly forbidden.</li>
                <li>NO Distribution: Sharing, publishing, or sub-licensing is prohibited.</li>
                <li>NO Deployment: Hosting or running on any server is forbidden (except by Frostvale Studio).</li>
                <li>NO AI Training: Use of this code to train or prompt AI/ML models is strictly forbidden.</li>
                <li>NO Forking: Creating derivative works or forks of this software is strictly prohibited.</li>
                <li>NO Reverse Engineering: Attempting to reconstruct logic or architecture is forbidden.</li>
                <li>NO Automated Scraping: Use of bots or automated tools for analysis is prohibited.</li>
                <li>NO Branding Removal: All copyright notices must remain intact.</li>
              </ul>
            </section>

            <section className="mb-6">
              <h2 className="text-foreground text-xs font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                <Info size={12} className="text-primary" /> 3. Attribution
              </h2>
              <p className="text-[11px] leading-relaxed">
                Any reference to or study of this software must explicitly credit **Frostvale Studio** as the sole owner and creator.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-foreground text-xs font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" /> 4. Jurisdiction
              </h2>
              <p className="text-[11px] leading-relaxed">
                This License is governed by the laws of Canada. Any legal action shall be instituted in a court of competent jurisdiction in Canada.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-foreground text-xs font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" /> 5. No Warranty
              </h2>
              <p className="text-[10px] leading-relaxed italic opacity-70">
                THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND. FROSTVALE STUDIO SHALL NOT BE LIABLE FOR ANY CLAIMS ARISING FROM THE USE OF THIS SOFTWARE.
              </p>
            </section>

            <div className="p-4 rounded border border-primary/20 bg-primary/5 mt-8">
              <p className="text-[10px] font-bold text-primary uppercase text-center flex items-center justify-center gap-2">
                <Scale size={12} /> Violation of these terms results in immediate termination of rights and potential legal action.
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};