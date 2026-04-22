'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, Scale, AlertTriangle } from 'lucide-react';

interface LegalAcceptanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: () => void;
  onCancel: () => void;
}

export function LegalAcceptanceDialog({
  open,
  onOpenChange,
  onAccept,
  onCancel,
}: LegalAcceptanceDialogProps) {
  const [step, setStep] = useState<'privacy' | 'terms'>('privacy');
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  useEffect(() => {
    if (open) {
      setStep('privacy');
      setPrivacyAccepted(false);
      setTermsAccepted(false);
    }
  }, [open]);

  const handlePrivacyContinue = () => {
    if (privacyAccepted) {
      setStep('terms');
    }
  };

  const handleTermsAccept = () => {
    if (termsAccepted) {
      // Store acceptance in localStorage
      localStorage.setItem('codeflow-legal-accepted', 'true');
      localStorage.setItem('codeflow-legal-accepted-date', new Date().toISOString());
      onAccept();
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    onCancel();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] bg-[#0B0D0F] border-white/10">
        <DialogHeader>
          {step === 'privacy' ? (
            <>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Shield className="text-blue-400 h-5 w-5" />
                </div>
                <DialogTitle className="text-2xl">Privacy Policy</DialogTitle>
              </div>
              <DialogDescription className="text-muted-foreground">
                Please read and accept our Privacy Policy before continuing.
              </DialogDescription>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <Scale className="text-orange-400 h-5 w-5" />
                </div>
                <DialogTitle className="text-2xl">Terms of Service</DialogTitle>
              </div>
              <DialogDescription className="text-muted-foreground">
                Please read and accept our Terms of Service before continuing.
              </DialogDescription>
            </>
          )}
        </DialogHeader>

        <ScrollArea className="max-h-[50vh] pr-4">
          <div className="space-y-4 text-sm">
            {step === 'privacy' ? (
              <div className="space-y-4">
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h3 className="font-bold mb-2 text-blue-400">How We Store Your Data</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    CodeFlow IDE stores your data using Firebase, a secure cloud platform provided by Google. 
                    All data is encrypted in transit and at rest using industry-standard encryption protocols (TLS 1.3, AES-256).
                  </p>
                </div>

                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h3 className="font-bold mb-2 text-purple-400">Private Information We Store</h3>
                  <ul className="space-y-2 text-muted-foreground list-disc list-inside">
                    <li><strong>API Keys:</strong> Stored securely in Firebase Firestore, encrypted and accessible only to your authenticated account</li>
                    <li><strong>Code:</strong> Your code files and projects stored in Firebase Firestore and Storage, protected by Firebase Authentication</li>
                    <li><strong>Passwords:</strong> We do not store passwords directly. Authentication is handled through Firebase Authentication using secure OAuth providers</li>
                    <li><strong>User Profile:</strong> Basic profile information from your Google OAuth provider stored for account management</li>
                  </ul>
                </div>

                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h3 className="font-bold mb-2 text-green-400">Where Your Data Is Stored</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Your data is stored in Google Cloud Platform (GCP) data centers through Firebase services. 
                    Firebase automatically replicates your data across multiple geographic regions for high availability.
                  </p>
                </div>

                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h3 className="font-bold mb-2 text-orange-400">Data Access & Security</h3>
                  <ul className="space-y-2 text-muted-foreground list-disc list-inside">
                    <li>Users can only access their own data and workspaces</li>
                    <li>API keys are never exposed to other users or third parties</li>
                    <li>All data transfers use TLS 1.3 encryption</li>
                    <li>Data at rest is encrypted using AES-256</li>
                  </ul>
                </div>

                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h3 className="font-bold mb-2 text-cyan-400">Data Deletion</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    You may request deletion of your account and all associated data at any time. 
                    Upon account deletion, all your code, API keys, and profile information will be permanently removed within 30 days.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-red-500/10 rounded-lg p-4 border border-red-500/30">
                  <div className="flex items-start gap-2 mb-2">
                    <AlertTriangle className="text-red-400 h-5 w-5 shrink-0 mt-0.5" />
                    <h3 className="font-bold text-red-400">IMPORTANT DISCLAIMER: Code Damage</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed font-semibold">
                    CODEFLOW IDE IS NOT RESPONSIBLE FOR ANY DAMAGE TO YOUR CODE, PROJECTS, OR DATA.
                  </p>
                  <ul className="space-y-2 text-muted-foreground list-disc list-inside mt-3">
                    <li>The AI-powered code generation may produce code with errors, bugs, or security vulnerabilities</li>
                    <li>You are solely responsible for reviewing, testing, and validating all code before using it in production</li>
                    <li>We do not guarantee that code suggestions will be correct, secure, or suitable for your use case</li>
                    <li>Any damage, loss, or corruption of code resulting from using CodeFlow IDE is your sole responsibility</li>
                    <li>We recommend maintaining proper version control, backups, and testing procedures</li>
                  </ul>
                </div>

                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h3 className="font-bold mb-2 text-blue-400">Service Description</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    CodeFlow IDE is an AI-powered development environment provided on an "as is" and "as available" basis.
                  </p>
                </div>

                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h3 className="font-bold mb-2 text-green-400">User Responsibilities</h3>
                  <ul className="space-y-2 text-muted-foreground list-disc list-inside">
                    <li>Maintain the security of your account credentials</li>
                    <li>Not use the service for illegal or unauthorized purposes</li>
                    <li>Take full responsibility for the code you create and deploy</li>
                    <li>Properly secure API keys and sensitive information</li>
                  </ul>
                </div>

                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h3 className="font-bold mb-2 text-orange-400">Limitation of Liability</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    To the maximum extent permitted by law, CodeFlow IDE shall not be liable for any indirect, incidental, 
                    special, consequential, or punitive damages resulting from your use of the service.
                  </p>
                </div>

                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h3 className="font-bold mb-2 text-yellow-400">No Warranty</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    CodeFlow IDE is provided "as is" without warranty of any kind. We do not warrant that the service 
                    will be uninterrupted, secure, or error-free.
                  </p>
                </div>

                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h3 className="font-bold mb-2 text-purple-400">Intellectual Property</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    CodeFlow IDE is licensed under Apache 2.0. You retain ownership of code you create, but must comply 
                    with all open source licenses for any code you incorporate.
                  </p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="flex-col sm:flex-col gap-4 mt-4">
          <div className="flex items-start gap-3 w-full p-3 bg-white/5 rounded-lg border border-white/10">
            <Checkbox
              id={step === 'privacy' ? 'privacy-check' : 'terms-check'}
              checked={step === 'privacy' ? privacyAccepted : termsAccepted}
              onCheckedChange={(checked) => {
                if (step === 'privacy') {
                  setPrivacyAccepted(checked as boolean);
                } else {
                  setTermsAccepted(checked as boolean);
                }
              }}
              className="mt-1"
            />
            <label
              htmlFor={step === 'privacy' ? 'privacy-check' : 'terms-check'}
              className="text-sm text-muted-foreground leading-relaxed cursor-pointer"
            >
              {step === 'privacy' 
                ? "I have read and agree to the Privacy Policy above."
                : "I have read and agree to the Terms of Service above, including the disclaimer about code damage."}
            </label>
          </div>

          <div className="flex gap-3 w-full">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            {step === 'privacy' ? (
              <Button
                onClick={handlePrivacyContinue}
                disabled={!privacyAccepted}
                className="flex-1"
              >
                Continue to Terms
              </Button>
            ) : (
              <Button
                onClick={handleTermsAccept}
                disabled={!termsAccepted}
                className="flex-1"
              >
                Accept & Continue
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
