// lib/notifications.ts
// In-app notifications only. No email sending.

import { createAdminSupabase } from './supabase';

interface NotifyParams {
  userId: string;
  type: string;
  title: string;
  body: string;
  link ? : string | null;
}

export async function createNotification(params: NotifyParams): Promise < void > {
  const supabase = createAdminSupabase();
  await supabase.from('notifications').insert({
    user_id: params.userId,
    type: params.type,
    title: params.title,
    body: params.body,
    link: params.link ?? null,
  });
}

export async function createAdminMessage(params: {
  userId: string;
  subject: string;
  message: string;
  adminId: string;
}): Promise < void > {
  const supabase = createAdminSupabase();
  
  await supabase.from('notifications').insert({
    user_id: params.userId,
    type: 'admin_message',
    title: params.subject,
    body: params.message,
    link: null,
  });
  
  await supabase.from('audit_log').insert({
    admin_id: params.adminId,
    target_type: 'user',
    target_id: params.userId,
    field_changed: 'admin_message',
    new_value: params.subject,
  });
}