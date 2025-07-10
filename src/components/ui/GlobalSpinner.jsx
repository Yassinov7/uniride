'use client';
import { useLoadingStore } from '@/store/loadingStore';
import { Bus } from 'lucide-react';

export default function GlobalSpinner() {
  const isLoading = useLoadingStore((state) => state.isLoading);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[1000] bg-black/25 backdrop-blur-sm flex items-center justify-center">
      <div className="flex flex-col items-center space-y-0.5">
        {/* Bouncing Bus */}
        <div className="animate-bounce">
          <Bus className="w-18 h-18 text-blue-600 drop-shadow-2xl" />
        </div>

        {/* Animated Orange Dashes */}
        <div className="flex space-x-1">
          <span className="w-4 h-1.5 bg-orange-500 rounded-4xl animate-pulse " style={{ animationDelay: '0s' }}/>
          <span className="w-4 h-1.5 bg-orange-500 rounded-4xl animate-pulse " style={{ animationDelay: '0.2s' }}/>
          <span className="w-4 h-1.5 bg-orange-500 rounded-4xl animate-pulse " style={{ animationDelay: '0.4s' }}/>
          <span className="w-4 h-1.5 bg-orange-500 rounded-4xl animate-pulse " style={{ animationDelay: '0.6s' }}/>
        </div>
      </div>
    </div>
  );
}
