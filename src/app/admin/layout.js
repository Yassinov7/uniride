'use client';

import CommonHeader from '@/components/CommonHeader';
import Link from 'next/link';
import { useState } from 'react';
import {
    X,
    University,
    Bus,
    Route,
    Users,
    FileDown,
    LayoutDashboard,
    HomeIcon,
    BadgeDollarSign,
    Inbox
} from 'lucide-react';

const navItems = [
    { name: 'الصفحة الرئيسية', href: '/admin', icon: <LayoutDashboard size={18} /> },
    { name: 'الجامعات', href: '/admin/universities', icon: <University size={18} /> },
    { name: 'الباصات', href: '/admin/buses', icon: <Bus size={18} /> },
    { name: 'المناطق السكنية', href: '/admin/locations', icon: <HomeIcon size={18} /> },
    { name: 'طلبات الحجز', href: '/admin/requests', icon: <Route size={18} /> },
    { name: 'ارصدة الطلاب', href: '/admin/wallets', icon: <BadgeDollarSign size={18} /> },
    { name: 'سجل المعاملات', href: '/admin/wallets/history', icon: <Inbox size={18} /> },
    { name: 'رحلات الذهاب', href: '/admin/rides/creatego', icon: <Route size={18} /> },
    { name: 'رحلات العودة', href: '/admin/rides/createreturn', icon: <Route size={18} /> },
    { name: 'سجل الطلاب', href: '/admin/users', icon: <Users size={18} /> },
    { name: 'تصدير البيانات', href: '/admin/export', icon: <FileDown size={18} /> },
];

export default function AdminLayout({ children }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="flex flex-col min-h-screen">
            {/* Header المشترك */}
            <CommonHeader onMenuClick={() => setOpen(true)} />

            <div className="flex flex-1">
                {/* Sidebar - Large Screens */}
                <aside className="hidden md:flex flex-col w-64 bg-blue-600 text-white">
                    <div className="p-6 text-xl font-bold border-b border-blue-500">
                        لوحة التحكم
                    </div>
                    <nav className="flex-1 px-4 py-6 space-y-3">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex items-center gap-2 px-3 py-2 rounded hover:bg-orange-500 transition"
                            >
                                {item.icon}
                                <span className="text-white">{item.name}</span>
                            </Link>
                        ))}
                    </nav>
                    <Link
                        href="/"
                        className="bg-blue-700 py-3 text-center hover:bg-orange-500 transition"
                    >
                        العودة للرئيسية
                    </Link>
                </aside>

                {/* Mobile Drawer */}
                {open && (
                    <div
                        className="fixed inset-0 z-40 bg-black/20"
                        onClick={() => setOpen(false)}
                    >
                        <aside
                            className="w-64 h-full bg-blue-600 text-white shadow-md p-4 fixed left-0 top-0 z-50"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="font-bold text-xl">القائمة</h2>
                                <button onClick={() => setOpen(false)}>
                                    <X size={24} />
                                </button>
                            </div>

                            <nav className="space-y-3">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setOpen(false)}
                                        className="flex items-center gap-2 px-3 py-2 rounded hover:bg-orange-500 transition"
                                    >
                                        {item.icon}
                                        <span>{item.name}</span>
                                    </Link>
                                ))}
                            </nav>

                            <Link
                                href="/"
                                className="block mt-6 bg-blue-700 text-center rounded py-2 hover:bg-orange-500 transition"
                            >
                                العودة للرئيسية
                            </Link>
                        </aside>
                    </div>
                )}

                {/* Main Content */}
                <main className="flex-1 bg-gray-100 p-6">{children}</main>
            </div>
        </div>
    );
}
