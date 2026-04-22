'use client';

import React, { useEffect } from 'react';
import { Scale, AlertTriangle, Code, Shield, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function TermsOfService() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="min-h-screen bg-[#0B0D0F] text-foreground">
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
              <Scale className="text-primary h-6 w-6" />
            </div>
            <h1 className="text-4xl font-black uppercase tracking-tighter">Terms of Service</h1>
          </div>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Last updated: April 20, 2026
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          {/* Acceptance of Terms */}
          <section className="bg-white/5 rounded-2xl p-8 border border-white/10">
            <div className="flex items-start gap-4 mb-4">
              <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
                <CheckCircle className="text-blue-400 h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-2">Acceptance of Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  By accessing or using CodeFlow IDE, you agree to be bound by these Terms of Service. 
                  If you do not agree to these terms, please do not use our service.
                </p>
              </div>
            </div>
          </section>

          {/* Code Damage Disclaimer - CRITICAL SECTION */}
          <section className="bg-red-500/10 rounded-2xl p-8 border border-red-500/30">
            <div className="flex items-start gap-4 mb-4">
              <div className="h-10 w-10 rounded-lg bg-red-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="text-red-400 h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-2 text-red-400">IMPORTANT DISCLAIMER: Code Damage</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  <strong className="text-foreground">CODEFLOW IDE IS NOT RESPONSIBLE FOR ANY DAMAGE TO YOUR CODE, PROJECTS, OR DATA.</strong>
                </p>
              </div>
            </div>
            <div className="ml-14 space-y-3 text-sm text-muted-foreground">
              <p>• The AI-powered code generation and editing features may produce code that contains errors, bugs, security vulnerabilities, or other issues.</p>
              <p>• You are solely responsible for reviewing, testing, and validating all code generated or modified by CodeFlow IDE before using it in production environments.</p>
              <p>• We do not guarantee that code suggestions will be correct, secure, or suitable for your specific use case.</p>
              <p>• Any damage, loss, or corruption of code, data, or projects resulting from the use of CodeFlow IDE is your sole responsibility.</p>
              <p>• We recommend maintaining proper version control, backups, and testing procedures for all your code.</p>
              <p>• Use of AI-generated code should always be reviewed by qualified developers before deployment.</p>
            </div>
          </section>

          {/* Service Description */}
          <section className="bg-white/5 rounded-2xl p-8 border border-white/10">
            <div className="flex items-start gap-4 mb-4">
              <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
                <Code className="text-purple-400 h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-2">Service Description</h2>
                <p className="text-muted-foreground leading-relaxed">
                  CodeFlow IDE is an AI-powered development environment that provides code generation, editing assistance, 
                  and cloud workspace features. The service is provided on an "as is" and "as available" basis.
                </p>
              </div>
            </div>
          </section>

          {/* User Responsibilities */}
          <section className="bg-white/5 rounded-2xl p-8 border border-white/10">
            <div className="flex items-start gap-4 mb-4">
              <div className="h-10 w-10 rounded-lg bg-green-500/20 flex items-center justify-center shrink-0">
                <Shield className="text-green-400 h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-2">User Responsibilities</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  As a user of CodeFlow IDE, you agree to:
                </p>
              </div>
            </div>
            <div className="ml-14 space-y-2 text-sm text-muted-foreground">
              <p>• Maintain the security of your account credentials</p>
              <p>• Not use the service for illegal or unauthorized purposes</p>
              <p>• Not attempt to reverse engineer or compromise the service</p>
              <p>• Comply with all applicable laws and regulations</p>
              <p>• Take full responsibility for the code you create and deploy</p>
              <p>• Properly secure API keys and sensitive information</p>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section className="bg-white/5 rounded-2xl p-8 border border-white/10">
            <div className="flex items-start gap-4 mb-4">
              <div className="h-10 w-10 rounded-lg bg-orange-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="text-orange-400 h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-2">Limitation of Liability</h2>
                <p className="text-muted-foreground leading-relaxed">
                  To the maximum extent permitted by applicable law, CodeFlow IDE, its developers, and affiliates 
                  shall not be liable for any indirect, incidental, special, consequential, or punitive damages, 
                  including without limitation, loss of profits, data, use, goodwill, or other intangible losses, 
                  resulting from your use of the service.
                </p>
              </div>
            </div>
          </section>

          {/* No Warranty */}
          <section className="bg-white/5 rounded-2xl p-8 border border-white/10">
            <div className="flex items-start gap-4 mb-4">
              <div className="h-10 w-10 rounded-lg bg-yellow-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="text-yellow-400 h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-2">No Warranty</h2>
                <p className="text-muted-foreground leading-relaxed">
                  CodeFlow IDE is provided "as is" without warranty of any kind, express or implied, including but not 
                  limited to warranties of merchantability, fitness for a particular purpose, and non-infringement. 
                  We do not warrant that the service will be uninterrupted, secure, or error-free.
                </p>
              </div>
            </div>
          </section>

          {/* Intellectual Property */}
          <section className="bg-white/5 rounded-2xl p-8 border border-white/10">
            <div className="flex items-start gap-4 mb-4">
              <div className="h-10 w-10 rounded-lg bg-cyan-500/20 flex items-center justify-center shrink-0">
                <Scale className="text-cyan-400 h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-2">Intellectual Property</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  CodeFlow IDE is licensed under the Apache 2.0 License. You retain ownership of any code you create 
                  using the service. However, you agree that:
                </p>
              </div>
            </div>
            <div className="ml-14 space-y-2 text-sm text-muted-foreground">
              <p>• The CodeFlow IDE software, interface, and underlying technology remain our intellectual property</p>
              <p>• AI-generated code may be used in accordance with applicable AI service terms</p>
              <p>• You must comply with all open source licenses for any code you incorporate into your projects</p>
            </div>
          </section>

          {/* Termination */}
          <section className="bg-white/5 rounded-2xl p-8 border border-white/10">
            <div className="flex items-start gap-4 mb-4">
              <div className="h-10 w-10 rounded-lg bg-pink-500/20 flex items-center justify-center shrink-0">
                <Shield className="text-pink-400 h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-2">Termination</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We reserve the right to suspend or terminate your access to CodeFlow IDE at any time, with or without 
                  cause, with or without notice. Upon termination, your right to use the service will immediately cease.
                </p>
              </div>
            </div>
          </section>

          {/* Changes to Terms */}
          <section className="bg-white/5 rounded-2xl p-8 border border-white/10">
            <div className="flex items-start gap-4 mb-4">
              <div className="h-10 w-10 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0">
                <Scale className="text-indigo-400 h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-2">Changes to Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We reserve the right to modify these Terms of Service at any time. Continued use of the service after 
                  changes constitutes acceptance of the new terms.
                </p>
              </div>
            </div>
          </section>

          {/* Governing Law */}
          <section className="bg-white/5 rounded-2xl p-8 border border-white/10">
            <div className="flex items-start gap-4 mb-4">
              <div className="h-10 w-10 rounded-lg bg-teal-500/20 flex items-center justify-center shrink-0">
                <Scale className="text-teal-400 h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-2">Governing Law</h2>
                <p className="text-muted-foreground leading-relaxed">
                  These Terms of Service shall be governed by and construed in accordance with applicable laws. 
                  Any disputes arising from these terms shall be resolved in accordance with applicable dispute 
                  resolution procedures.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-white/10 flex justify-between items-center">
          <Link href="/privacy-policy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            ← View Privacy Policy
          </Link>
          <Link href="/" className="text-sm text-primary hover:text-primary/80 transition-colors">
            Back to CodeFlow IDE →
          </Link>
        </div>
      </div>
    </div>
  );
}
