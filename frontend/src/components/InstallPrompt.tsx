import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setShowPrompt(false);
    } else {
      console.log('User dismissed the install prompt');
    }
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-surface-container shadow-elevation-3 rounded-2xl p-4 border border-outline-variant z-50 flex items-start gap-4 animate-in slide-in-from-bottom-5">
      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
        <img src="/favicon.png" alt="Welile Car App" className="w-8 h-8 object-contain" />
      </div>
      
      <div className="flex-1">
        <h3 className="font-headline-md font-bold text-on-surface text-base">Install Welile Car App</h3>
        <p className="text-body-sm text-on-surface-variant mt-1">
          Install our application for a better, faster, and offline-capable experience on your device.
        </p>
        
        <div className="flex items-center gap-2 mt-3">
          <button 
            onClick={handleInstallClick}
            className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-full font-bold text-sm hover:bg-primary/90 transition-colors"
          >
            <Download size={16} />
            Install App
          </button>
          
          <button 
            onClick={() => setShowPrompt(false)}
            className="text-on-surface-variant px-3 py-2 rounded-full text-sm font-medium hover:bg-surface-container-high transition-colors"
          >
            Maybe Later
          </button>
        </div>
      </div>
      
      <button 
        onClick={() => setShowPrompt(false)}
        className="text-on-surface-variant p-1 hover:bg-surface-container-high rounded-full shrink-0"
      >
        <X size={16} />
      </button>
    </div>
  );
};
