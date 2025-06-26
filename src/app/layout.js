export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <head />
      <body className="bg-white text-gray-900 font-sans">{children}</body>
    </html>
  );
}
