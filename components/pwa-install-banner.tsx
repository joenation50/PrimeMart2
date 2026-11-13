'use client';

import { useEffect, useState } from 'react';
import { Download, X, Share } from 'lucide-react';

export function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 1. Check if user dismissed it previously
    const isDismissed = localStorage.getItem('pwa_banner_dismissed');
    if (isDismissed) return;

    // 2. Check if it's an iPhone
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // 3. Listen for the native Android/Desktop prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 4. FALLBACK TIMER: If the browser doesn't fire the prompt in 3 seconds,
    // we show the banner anyway so the user can see it.
    const timer = setTimeout(() => {
      if (!localStorage.getItem('pwa_banner_dismissed')) {
        setShowBanner(true);
      }
    }, 3000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearTimeout(timer);
    };
  }, []);

  const handleInstallClick = async () => {
    // If the browser gave us a prompt, trigger it natively
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowBanner(false);
        localStorage.setItem('pwa_banner_dismissed', 'true');
      }
      setDeferredPrompt(null);
    } else {
      // If no prompt, show instructions
      alert("To install: Tap your browser's menu (3 dots) and select 'Add to Home Screen' or 'Install App'.");
    }
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
          {isIOS ? (
            <p className="text-xs opacity-80 flex items-center gap-1">
              Tap <Share className="h-3 w-3 mx-1" /> then <b>Add to Home Screen</b>.
            </p>
          ) : (
            <p className="text-xs opacity-80">Add to home screen for quick access.</p>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {!isIOS && (
          <button onClick={handleInstallClick} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground">
            Install
          </button>
        )}
        <button onClick={handleDismiss} className="rounded-lg p-1.5 hover:bg-background/20">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}