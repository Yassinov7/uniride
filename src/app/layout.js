import './globals.css'
export const metadata = {
  title: 'UniRide Application',
  description: 'نظام ذكي لتنظيم النقل الجامعي',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <head />
      <body className="font-sans">{children}</body>
    </html>
  )
}