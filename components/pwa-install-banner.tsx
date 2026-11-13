'use client';

import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

export function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user dismissed it previously
    const isDismissed = localStorage.getItem('pwa_banner_dismissed');
    if (isDismissed) return;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
      localStorage.setItem('pwa_banner_dismissed', 'true');
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('pwa_banner_dismissed', 'true');
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-[60] flex items-center justify-between gap-4 rounded-2xl bg-foreground p-4 text-background shadow-2xl md:bottom-4 md:left-auto md:right-4 md:w-96 animate-in slide-in-from-bottom-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Download className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-bold">Install PrimeMart</p>
          <p className="text-xs opacity-80">Add to home screen for quick access.</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button onClick={handleInstallClick} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground">
          Install
        </button>
        <button onClick={handleDismiss} className="rounded-lg p-1.5 hover:bg-background/20">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}