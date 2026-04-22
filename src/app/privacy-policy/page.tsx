'use client';

import React, { useEffect } from 'react';
import { Shield, Database, Lock, Eye } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPolicy() {
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
              <Shield className="text-primary h-6 w-6" />
            </div>
            <h1 className="text-4xl font-black uppercase tracking-tighter">Privacy Policy</h1>
          </div>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Last updated: April 20, 2026
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          {/* Data Storage Section */}
          <section className="bg-white/5 rounded-2xl p-8 border border-white/10">
            <div className="flex items-start gap-4 mb-4">
              <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
                <Database className="text-blue-400 h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-2">How We Store Your Data</h2>
                <p className="text-muted-foreground leading-relaxed">
                  CodeFlow IDE stores your data using Firebase, a secure cloud platform provided by Google. 
                  All data is encrypted in transit and at rest using industry-standard encryption protocols.
                </p>
              </div>
            </div>
          </section>

          {/* Private Information Section */}
          <section className="bg-white/5 rounded-2xl p-8 border border-white/10">
            <div className="flex items-start gap-4 mb-6">
              <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
                <Lock className="text-purple-400 h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-2">Private Information We Store</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We collect and store the following types of private information to provide our services:
                </p>
              </div>
            </div>

            <div className="space-y-4 ml-14">
              <div className="border-l-2 border-primary/30 pl-4">
                <h3 className="font-semibold text-foreground mb-1">API Keys</h3>
                <p className="text-sm text-muted-foreground">
                  API keys that you configure for use with AI services and external integrations are stored securely in your user profile within Firebase Firestore. These keys are encrypted and only accessible to your authenticated account.
                </p>
              </div>

              <div className="border-l-2 border-primary/30 pl-4">
                <h3 className="font-semibold text-foreground mb-1">Code</h3>
                <p className="text-sm text-muted-foreground">
                  Your code files, projects, and workspace data are stored in Firebase Firestore and Storage. Code is associated with your user account and is protected by Firebase Authentication. Guest accounts have temporary storage that may be cleared after session expiration.
                </p>
              </div>

              <div className="border-l-2 border-primary/30 pl-4">
                <h3 className="font-semibold text-foreground mb-1">Passwords & Authentication</h3>
                <p className="text-sm text-muted-foreground">
                  We do not store passwords directly. Authentication is handled through Firebase Authentication, which uses secure OAuth providers (Google) or guest sessions. Firebase manages credential security using industry best practices.
                </p>
              </div>

              <div className="border-l-2 border-primary/30 pl-4">
                <h3 className="font-semibold text-foreground mb-1">User Profile Data</h3>
                <p className="text-sm text-muted-foreground">
                  Basic profile information (name, email, profile picture) is obtained from your Google OAuth provider and stored in Firebase Authentication and Firestore to manage your account and workspace.
                </p>
              </div>
            </div>
          </section>

          {/* Data Location Section */}
          <section className="bg-white/5 rounded-2xl p-8 border border-white/10">
            <div className="flex items-start gap-4 mb-4">
              <div className="h-10 w-10 rounded-lg bg-green-500/20 flex items-center justify-center shrink-0">
                <Eye className="text-green-400 h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-2">Where Your Data Is Stored</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Your data is stored in Google Cloud Platform (GCP) data centers through Firebase services. 
                  Firebase automatically replicates your data across multiple geographic regions for high availability and disaster recovery.
                </p>
              </div>
            </div>
            <div className="ml-14 mt-4 space-y-2 text-sm text-muted-foreground">
              <p>• <strong>Firestore:</strong> NoSQL database for structured data (user profiles, project metadata)</p>
              <p>• <strong>Firebase Storage:</strong> Object storage for files and larger assets</p>
              <p>• <strong>Firebase Authentication:</strong> Secure identity management</p>
            </div>
          </section>

          {/* Data Access Section */}
          <section className="bg-white/5 rounded-2xl p-8 border border-white/10">
            <div className="flex items-start gap-4 mb-4">
              <div className="h-10 w-10 rounded-lg bg-orange-500/20 flex items-center justify-center shrink-0">
                <Shield className="text-orange-400 h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-2">Data Access & Security</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Your data is accessible only to you through authenticated sessions. We implement Firebase Security Rules to ensure that:
                </p>
              </div>
            </div>
            <div className="ml-14 mt-4 space-y-2 text-sm text-muted-foreground">
              <p>• Users can only access their own data and workspaces</p>
              <p>• API keys are never exposed to other users or third parties</p>
              <p>• All data transfers use TLS 1.3 encryption</p>
              <p>• Data at rest is encrypted using AES-256</p>
            </div>
          </section>

          {/* Data Deletion Section */}
          <section className="bg-white/5 rounded-2xl p-8 border border-white/10">
            <div className="flex items-start gap-4 mb-4">
              <div className="h-10 w-10 rounded-lg bg-red-500/20 flex items-center justify-center shrink-0">
                <Shield className="text-red-400 h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-2">Data Deletion</h2>
                <p className="text-muted-foreground leading-relaxed">
                  You may request deletion of your account and all associated data at any time. Upon account deletion, all your code, API keys, and profile information will be permanently removed from our systems within 30 days. Guest account data may be automatically deleted after inactivity periods.
                </p>
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section className="bg-white/5 rounded-2xl p-8 border border-white/10">
            <h2 className="text-xl font-bold mb-4">Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              If you have questions about this Privacy Policy or how we handle your data, please contact us.
            </p>
            <p className="text-sm text-muted-foreground">
              This application is open source and licensed under Apache 2.0. You can review the source code and contribute to security improvements.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-white/10 flex justify-between items-center">
          <Link href="/" className="text-sm text-primary hover:text-primary/80 transition-colors">
            ← Back to CodeFlow IDE
          </Link>
          <Link href="/terms-of-service" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            View Terms of Service →
          </Link>
        </div>
      </div>
    </div>
  );
}
