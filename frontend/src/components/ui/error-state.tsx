import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = "An unexpected error occurred.", onRetry, className, ...props }: ErrorStateProps) {
  return (
    <div className={cn("min-h-[50vh] flex flex-col items-center justify-center space-y-4 p-4 text-center", className)} {...props}>
      <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mb-2 shadow-inner">
        <AlertCircle size={32} />
      </div>
      <h3 className="text-2xl font-black text-slate-900 tracking-tight">Oops! Something went wrong</h3>
      <p className="text-slate-500 font-medium max-w-md">{message}</p>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="mt-6 px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
