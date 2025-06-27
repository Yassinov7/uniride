import './globals.css'

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <head >
        <title> UniRide Application </title>
      </head >
      <body className="font-sans">{children}</body>
    </html>
  )
}