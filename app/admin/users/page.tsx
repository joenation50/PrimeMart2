'use client';

import { useEffect, useState } from 'react';
import { createBrowserSupabase } from '@/lib/supabase-browser';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    async function fetchUsers() {
      const supabase = createBrowserSupabase();
      const { data, error } = await supabase.from('users').select('*');
      
      if (error) {
        alert("Database Error: " + error.message);
        console.error(error);
      } else {
        setUsers(data || []);
      }
    }
    fetchUsers();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Users ({users.length})</h1>
      <div className="space-y-4">
        {users.map(u => (
          <div key={u.id} className="p-4 border rounded">
            <p className="font-bold">{u.name}</p>
            <p className="text-sm">{u.email} - Role: {u.role}</p>
          </div>
        ))}
      </div>
    </div>
  );
}