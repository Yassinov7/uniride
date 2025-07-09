'use client';
import './globals.css'
import { Toaster } from 'react-hot-toast';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/store/userStore';
import GlobalSpinner from '@/components/ui/GlobalSpinner';


export default function RootLayout({ children }) {
  const { setUser } = useUserStore();

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            setUser(data);
          });
      } else {
        setUser(null);
      }
    });
  }, [setUser]);

  return (
    <html lang="ar" dir="rtl">
      <head>
        {/* Manifest and theme */}
        <link rel="manifest" href="/webmanifest.json" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="background-color" content="#eff6ff" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="نظام ذكي لتنظيم نقل الطلاب بين الجامعة والبيت" />

        {/* Favicons */}
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <title>UniRide</title>
      </head>

      <body>
        <Toaster position="top-center" reverseOrder={false} />
        <GlobalSpinner />
        {children}
      </body>
    </html>
  );
}