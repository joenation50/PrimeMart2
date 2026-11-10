// features/account/notification-prefs.tsx
'use client';

import { useState } from 'react';
import { updateNotificationPreferences } from '@/actions/account';
import { Loader2 } from 'lucide-react';

export function NotificationPrefs({ currentPrefs }: { currentPrefs: any }) {
  const [email, setEmail] = useState(currentPrefs?.email ?? true);
  const [inApp, setInApp] = useState(currentPrefs?.in_app ?? true);
  const [loading, setLoading] = useState(false);
  
  async function handleToggle(type: 'email' | 'in_app') {
    const newEmail = type === 'email' ? !email : email;
    const newInApp = type === 'in_app' ? !inApp : inApp;
    
    setEmail(newEmail);
    setInApp(newInApp);
    setLoading(true);
    
    await updateNotificationPreferences({ email: newEmail, in_app: newInApp });
    setLoading(false);
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">Email Notifications</p>
          <p className="text-sm text-muted-foreground">Receive updates about your account and listings.</p>
        </div>
        <button
          onClick={() => handleToggle('email')}
          disabled={loading}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${email ? 'bg-foreground' : 'bg-muted'}`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${email ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">In-App Notifications</p>
          <p className="text-sm text-muted-foreground">Show a red dot in the header when you have alerts.</p>
        </div>
        <button
          onClick={() => handleToggle('in_app')}
          disabled={loading}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${inApp ? 'bg-foreground' : 'bg-muted'}`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${inApp ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </div>
      
      <p className="text-xs text-muted-foreground pt-2">
        Note: Payment and renewal alerts are always sent.
      </p>
    </div>
  );
}