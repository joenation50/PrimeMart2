// lib/env.ts

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'ADMIN_EMAIL',
  'ADMIN_PASSWORD_HASH',
  'NEXT_PUBLIC_SITE_URL',
] as const;

type RequiredEnvVar = (typeof requiredEnvVars)[number];

function getEnvVar(key: RequiredEnvVar): string {
  const value = process.env[key];
  if (!value || value.trim() === '') {
    throw new Error(
      `Missing required environment variable: ${key}\n` +
        `Add it to .env.local or Cloudflare Environment Variables.`
    );
  }
  return value;
}

const missing: string[] = [];
for (const key of requiredEnvVars) {
  if (!process.env[key] || process.env[key]!.trim() === '') {
    missing.push(key);
  }
}

if (missing.length > 0) {
  throw new Error(
    `Missing ${missing.length} required environment variable(s):\n` +
      missing.map((k) => `  - ${k}`).join('\n')
  );
}

export const env = {
  supabaseUrl: getEnvVar('NEXT_PUBLIC_SUPABASE_URL'),
  supabaseAnonKey: getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  supabaseServiceRoleKey: getEnvVar('SUPABASE_SERVICE_ROLE_KEY'),

  cloudinaryCloudName: getEnvVar('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME'),
  cloudinaryApiKey: getEnvVar('CLOUDINARY_API_KEY'),
  cloudinaryApiSecret: getEnvVar('CLOUDINARY_API_SECRET'),

  adminEmail: getEnvVar('ADMIN_EMAIL'),
  adminPasswordHash: getEnvVar('ADMIN_PASSWORD_HASH'),

  siteUrl: getEnvVar('NEXT_PUBLIC_SITE_URL'),
} as const;