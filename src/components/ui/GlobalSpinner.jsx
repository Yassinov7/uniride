'use client';
import { useLoadingStore } from '@/store/loadingStore';
import { Bus } from 'lucide-react';

export default function GlobalSpinner() {
  const isLoading = useLoadingStore((state) => state.isLoading);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[1000] bg-black/40 backdrop-blur-sm flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        {/* Bouncing Bus */}
        <div className="animate-bounce">
          <Bus className="w-12 h-12 text-blue-600 drop-shadow-xl" />
        </div>

        {/* Animated Orange Dashes */}
        <div className="flex space-x-1">
          <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse [animation-delay:0s]" />
          <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse [animation-delay:0.2s]" />
          <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse [animation-delay:0.4s]" />
          <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse [animation-delay:0.6s]" />
        </div>
      </div>
    </div>
  );
}
