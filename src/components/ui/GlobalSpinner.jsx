'use client';
import { useEffect, useState } from 'react';
import { useLoadingStore } from '@/store/loadingStore';
import { Bus } from 'lucide-react';

export default function GlobalSpinner() {
  const isLoading = useLoadingStore((state) => state.isLoading);
  const [busPosition, setBusPosition] = useState(-100);

  useEffect(() => {
    if (isLoading) {
      let animationFrame;
      const animate = () => {
        setBusPosition((prev) => (prev >= 100 ? -100 : prev + 2)); // 2px per frame
        animationFrame = requestAnimationFrame(animate);
      };
      animate();

      return () => cancelAnimationFrame(animationFrame);
    } else {
      setBusPosition(-100);
    }
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[1000] bg-black/40 backdrop-blur-sm flex items-center justify-center">
      <div className="absolute bottom-16 left-0 right-0 h-12 bg-orange-500 rounded-full overflow-hidden">
        <div
          className="absolute -bottom-2"
          style={{
            transform: `translateX(${busPosition}%)`,
            transition: 'transform 0.05s linear',
          }}
        >
          <Bus className="text-blue-600 w-10 h-10 drop-shadow" />
        </div>
      </div>
    </div>
  );
}
