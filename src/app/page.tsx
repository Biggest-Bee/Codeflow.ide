'use client';

import React, { useState } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { FileProvider } from '@/context/FileContext';
import { Sidebar } from '@/components/Sidebar';
import { Editor } from '@/components/Editor';
import { AIAssistant } from '@/components/AIAssistant';
import { Toaster } from '@/components/ui/toaster';
import { PanelRightOpen, PanelRightClose, Sparkles, LogIn, Users, Loader2, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { LicenseDialog } from '@/components/LicenseDialog';

const Dashboard: React.FC = () => {
  const [isAiOpen, setIsAiOpen] = useState(true);

  return (
    <div className="flex h-screen bg-background overflow-hidden relative">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 bg-background relative overflow-hidden h-full">
        <div className="flex-1 overflow-hidden relative">
          <Editor />
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "absolute top-[6px] right-2 z-50 h-7 w-7 transition-all duration-300",
              isAiOpen 
                ? "text-primary bg-primary/10 border border-primary/20 hover:bg-primary/20" 
                : "text-muted-foreground hover:text-primary hover:bg-primary/5"
            )}
            onClick={() => setIsAiOpen(!isAiOpen)}
            title={isAiOpen ? "Close AI Assistant" : "Open AI Assistant"}
          >
            {isAiOpen ? <PanelRightClose size={14} /> : <PanelRightOpen size={14} />}
          </Button>
        </div>
      </main>
      <div 
        className={cn(
          "transition-all duration-300 ease-in-out border-l bg-sidebar overflow-hidden shrink-0",
          isAiOpen ? "w-80 opacity-100" : "w-0 opacity-0 pointer-events-none"
        )}
      >
        <AIAssistant />
      </div>
    </div>
  );
};

const LoginScreen: React.FC = () => {
  const { signInWithGoogle, signInAsGuest, isLoading } = useAuth();

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0D0F] relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px]" />
      
      <div className="z-10 flex flex-col items-center space-y-8 max-w-lg px-6 text-center">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30 shadow-2xl shadow-primary/20">
            <Sparkles className="text-primary h-6 w-6" />
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-foreground">CodeFlow IDE</h1>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-foreground/90">Your AI Architecture Studio awaits.</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Choose a sign-in method to access your persistent cloud workspaces and professional AI code generation engine.
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full max-w-sm">
          <Button 
            size="lg" 
            onClick={signInWithGoogle} 
            disabled={isLoading}
            className="w-full h-12 gap-3 text-sm font-bold uppercase tracking-widest shadow-xl shadow-primary/20"
          >
            {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : <LogIn className="h-4 w-4" />}
            Continue with Google
          </Button>
          
          <Button 
            variant="outline"
            size="lg" 
            onClick={signInAsGuest} 
            disabled={isLoading}
            className="w-full h-12 gap-3 text-sm font-bold uppercase tracking-widest border-primary/20 hover:bg-primary/10 hover:border-primary/40 transition-all"
          >
            {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : <Users className="h-4 w-4" />}
            Continue as Guest
          </Button>
        </div>

        <div className="flex flex-col items-center gap-4 mt-12 w-full max-w-xl">
          <div className="flex items-center justify-center gap-6 w-full whitespace-nowrap border-t border-white/5 pt-6">
            <p className="text-[8px] text-primary/80 uppercase font-black tracking-[0.2em]">
              © 2026 Frostvale Studio • All Rights Reserved
            </p>
            <div className="h-3 w-[1px] bg-white/10" />
            <LicenseDialog 
              trigger={
                <Button variant="ghost" size="sm" className="h-auto p-0 gap-1.5 text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors">
                  <Scale size={10} /> View Software License
                </Button>
              }
            />
          </div>
          
          <p className="text-[7px] text-muted-foreground/40 uppercase font-bold tracking-[0.4em]">
            Secure Cloud Storage • Guest or Google OAuth • Proprietary Architecture Studio
          </p>
        </div>
      </div>
    </div>
  );
};

const AppShell: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background">
        <Sparkles className="text-primary h-8 w-8 animate-spin mb-4" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground animate-pulse">Initializing Workspace...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden bg-background selection:bg-primary/30">
      {user ? <Dashboard /> : <LoginScreen />}
      <Toaster />
    </div>
  );
};

export default function Home() {
  return (
    <AuthProvider>
      <FileProvider>
        <AppShell />
      </FileProvider>
    </AuthProvider>
  );
}
