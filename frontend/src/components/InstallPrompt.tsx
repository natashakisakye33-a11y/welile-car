import { useState, useEffect } from 'react';
import { Download, X, Share } from 'lucide-react';

export const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showManualInstructions, setShowManualInstructions] = useState(false);

  useEffect(() => {
    // Don't show if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return;
    }
    
    // Don't show if user previously dismissed
    if (localStorage.getItem('hideInstallPrompt') === 'true') {
      return;
    }

    // Show by default to make it persistent on all browsers
    setShowPrompt(true);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    } else {
      // Fallback for Safari/Firefox
      setShowManualInstructions(true);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('hideInstallPrompt', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-[400px] bg-surface-container shadow-elevation-3 rounded-2xl p-4 border border-outline-variant z-50 flex items-start gap-4 animate-in slide-in-from-bottom-5">
      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
        <img src="/favicon.png" alt="Welile Car App" className="w-8 h-8 object-contain" />
      </div>
      
      <div className="flex-1">
        <h3 className="font-headline-md font-bold text-on-surface text-base">Install Welile Car App</h3>
        <p className="text-body-sm text-on-surface-variant mt-1">
          Install our application for a better, faster, and offline-capable experience on your device.
        </p>
        
        {showManualInstructions ? (
          <div className="mt-3 p-3 bg-surface-container-high rounded-xl text-sm text-on-surface-variant border border-outline-variant/50">
            <p className="font-bold mb-1 flex items-center gap-1.5 text-on-surface">
              <Share size={14} /> Manual Install Required
            </p>
            <ul className="list-disc pl-4 space-y-1">
              <li><strong>iOS/Safari:</strong> Tap the Share button at the bottom, then select "Add to Home Screen".</li>
              <li><strong>Other Browsers:</strong> Look for "Install" or "Add to Home Screen" in your browser menu.</li>
            </ul>
          </div>
        ) : (
          <div className="flex items-center gap-2 mt-3">
            <button 
              onClick={handleInstallClick}
              className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-full font-bold text-sm hover:bg-primary/90 transition-colors"
            >
              <Download size={16} />
              Install App
            </button>
            
            <button 
              onClick={handleDismiss}
              className="text-on-surface-variant px-3 py-2 rounded-full text-sm font-medium hover:bg-surface-container-high transition-colors"
            >
              Maybe Later
            </button>
          </div>
        )}
      </div>
      
      <button 
        onClick={handleDismiss}
        className="text-on-surface-variant p-1 hover:bg-surface-container-high rounded-full shrink-0"
      >
        <X size={16} />
      </button>
    </div>
  );
};
