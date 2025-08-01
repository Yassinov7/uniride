import './globals.css'
import { Toaster } from 'react-hot-toast';

import GlobalSpinner from '@/components/ui/GlobalSpinner';


export default function RootLayout({ children }) {


  return (
    <html lang="ar" dir="rtl">
      <head>
        {/* <!-- Basic Info --> */}
        <title>UniRide</title>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="description" content="نظام ذكي لتنظيم نقل الطلاب بين الجامعة والبيت" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="background-color" content="#eff6ff" />
        <meta name="apple-mobile-web-app-title" content="UniRide" />
        <meta name="application-name" content="UniRide" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />

        {/* <!-- PWA Manifest --> */}
        <link rel="manifest" href="/webmanifest.json" />

        {/* <!-- Favicons --> */}
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="shortcut icon" href="/favicon.ico" />

        {/* <!-- Windows Tiles --> */}
        <meta name="msapplication-TileColor" content="#2563eb" />
        <meta name="msapplication-TileImage" content="/android-chrome-192x192.png" />
      </head>


      <body>
        <Toaster position="top-center" reverseOrder={false} />
        <GlobalSpinner />
        {children}
      </body>
    </html>
  );
}