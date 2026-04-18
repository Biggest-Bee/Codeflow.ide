import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. SKIP ERRORS: Keep your bypass for Promise type issues
  typescript: {
    ignoreBuildErrors: true,
  },

  // Empty turbopack config to silence Next.js 16 warning
  turbopack: {} as any,

  // 2. SECURITY HEADERS: Removed COOP/COEP to allow Firebase Auth popup to close properly

  // 3. WINDOWS SYMLINK FIX: Essential for your EPERM errors
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve.symlinks = false;
    }
    return config;
  },

  // 4. WORKSTATION ORIGINS: Whitelist for your specific cloud environment
  allowedDevOrigins: [
    '6000-firebase-studio-1772137161584.cluster-id7eoc2eeze4orwbg47mtb36q.cloudworkstations.dev',
    '9000-firebase-studio-1772137161584.cluster-id7eoc2eeze4orwbg47mtb36q.cloudworkstations.dev',
    '9002-firebase-studio-1772137161584.cluster-id7eoc2eeze4orwbg47mtb36q.cloudworkstations.dev'
  ] as any,

  // 5. OPEN TELEMETRY: Top-level property for instrumentation
  serverExternalPackages: [
    '@opentelemetry/instrumentation-winston',
    '@opentelemetry/winston-transport',
    '@opentelemetry/exporter-jaeger',
    'import-in-the-middle',
    'require-in-the-middle'
  ],

  experimental: {
    // SERVER ACTIONS: Keep workstation support and 10mb limit
    serverActions: {
      allowedOrigins: [
        '6000-firebase-studio-1772137161584.cluster-id7eoc2eeze4orwbg47mtb36q.cloudworkstations.dev',
        '9000-firebase-studio-1772137161584.cluster-id7eoc2eeze4orwbg47mtb36q.cloudworkstations.dev',
        '9002-firebase-studio-1772137161584.cluster-id7eoc2eeze4orwbg47mtb36q.cloudworkstations.dev'
      ],
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;