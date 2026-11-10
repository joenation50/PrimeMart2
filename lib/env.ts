// lib/env.ts
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'ADMIN_EMAIL', 
  // 'ADMIN_PASSWORD_HASH', <-- REMOVE THIS LINE
  'NEXT_PUBLIC_SITE_URL',
] as const;

// ... (keep everything else the same, just remove the hash from the exported object at the bottom)

export const env = {
  // ...
  adminEmail: getEnvVar('ADMIN_EMAIL'),
  // adminPasswordHash: getEnvVar('ADMIN_PASSWORD_HASH'), <-- REMOVE THIS LINE
  // ...
} as const;