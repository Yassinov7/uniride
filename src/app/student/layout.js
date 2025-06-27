import Link from 'next/link';


const navItems = [
  { href: '/student/rides', label: 'الرحلات' },
  { href: '/student/balance', label: 'الرصيد' },
  { href: '/student/profile', label: 'الملف الشخصي' },
  { href: '/student/history', label: 'السجل' },
];

export default function StudentLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar for desktop */}
      <aside className="hidden md:flex md:flex-col w-56 bg-white border-r shadow-sm">
        <div className="text-center text-blue-700 font-bold text-xl py-6 border-b">UniRide</div>
        <nav className="flex flex-col gap-2 p-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-blue-700 font-medium hover:bg-blue-50 px-3 py-2 rounded"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-grow px-4 py-6">{children}</main>

      {/* Bottom Nav for mobile */}
      <nav className="fixed bottom-0 inset-x-0 bg-white shadow-inner border-t flex justify-around py-2 md:hidden z-10">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-sm text-blue-700 font-medium hover:underline"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
