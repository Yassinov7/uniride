'use client';
import './globals.css'
import { Toaster } from 'react-hot-toast';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/store/userStore';

export default function RootLayout({ children }) {
  const { setUser } = useUserStore();

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        supabase.from('profiles').select('*').eq('id', session.user.id).single().then(({ data }) => {
          setUser(data);
        });
      } else {
        setUser(null);
      }
    });
  }, [setUser]);

  return (
    <html lang="ar" dir="rtl">
      <body>
        <Toaster position="top-center" reverseOrder={false} />
        {children}
      </body>
    </html>
  );
}
