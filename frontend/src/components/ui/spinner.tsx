import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number;
}

export function Spinner({ size = 24, className, ...props }: SpinnerProps) {
  return (
    <div className={cn("flex items-center justify-center", className)} {...props}>
      <Loader2 size={size} className="animate-spin text-primary" />
    </div>
  );
}

export function PageLoader({ message = "Loading..." }: { message?: string }) {
  const [showLongWaitMessage, setShowLongWaitMessage] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLongWaitMessage(true);
    }, 5000); // Show after 5 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4 p-6 text-center">
      <Spinner size={40} />
      <div className="flex flex-col items-center gap-2">
        <div className="text-slate-500 font-medium animate-pulse">{message}</div>
        {showLongWaitMessage && (
          <div className="text-sm text-slate-400 max-w-xs animate-in fade-in slide-in-from-bottom-2 duration-500">
            Please wait while we wake up our secure servers. This may take up to 50 seconds.
          </div>
        )}
      </div>
    </div>
  );
}
