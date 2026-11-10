// lib/audit.ts

import { createAdminSupabase } from './supabase';

interface AuditParams {
  adminId: string | null;
  targetType: string;
  targetId?: string | null;
  fieldChanged?: string | null;
  oldValue?: string | null;
  newValue?: string | null;
  reason?: string | null;
}

export async function writeAuditLog(params: AuditParams): Promise<void> {
  const supabase = createAdminSupabase();
  await supabase.from('audit_log').insert({
    admin_id: params.adminId,
    target_type: params.targetType,
    target_id: params.targetId ?? null,
    field_changed: params.fieldChanged ?? null,
    old_value: params.oldValue ?? null,
    new_value: params.newValue ?? null,
    reason: params.reason ?? null,
  });
}