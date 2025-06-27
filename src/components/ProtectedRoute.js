'use client';

import { useUserStore } from '@/store/userStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedRoute({ children }) {
  const { user } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user]);

  if (!user) return null; // ممكن لاحقًا تعمل loading spinner هون

  return children;
}
