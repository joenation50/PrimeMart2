// lib/env.ts
// We don't throw during build. We only warn.
// The actual check happens when a page is loaded at runtime.

function getEnvVar(key: string): string {
  const value = process.env[key];
  if (!value || value.trim() === '') {
    // Just warn during build, don't crash the build process.
    console.warn(`[env] Missing variable at build time: ${key}`);
    return '';
  }
  return value;
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