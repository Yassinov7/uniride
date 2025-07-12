'use client';

import { useState } from 'react';
import Link from 'next/link';
import CommonHeader from '@/components/CommonHeader';
import {
    X,
    LayoutDashboard,
    FileDown,
    BadgeDollarSign,
    Bus,
    Inbox,
    UserCircle2,
    FileUp,
    ReceiptTextIcon,
    LogOut
} from 'lucide-react';
import AuthProvider from '@/components/AuthProvider';
import useLogout from '@/hooks/useLogout';

const navItems = [
    { name: 'الصفحة الرئيسية', href: '/student', icon: <LayoutDashboard size={18} /> },
    { name: 'الحجز', href: '/student/request', icon: <Bus size={18} /> },
    { name: 'رحلاتي', href: '/student/next', icon: <FileUp size={18} /> },
    { name: 'رحلة العودة', href: '/student/return', icon: <FileDown size={18} /> },
    { name: 'سجل الرحلات', href: '/student/history', icon: <ReceiptTextIcon size={18} /> },
    { name: 'رصيدي', href: '/student/wallet', icon: <BadgeDollarSign size={18} /> },
    { name: 'فواتيري', href: '/student/wallet/history', icon: <Inbox size={18} /> },
    { name: 'البيانات الشخصية', href: '/student/profile', icon: <UserCircle2 size={18} /> },
];

export default function StudentLayout({ children }) {
    const [open, setOpen] = useState(false);
    const logout = useLogout();

    

    return (
        <div className="flex flex-col min-h-screen">
            <CommonHeader onMenuClick={() => setOpen(true)} />

            <div className="flex flex-1">
                {/* Sidebar - Large Screens */}
                <aside className="hidden md:flex flex-col w-64 bg-blue-600 text-white">
                    <div className="p-6 text-xl font-bold border-b border-blue-500">
                        منطقة الطالب
                    </div>
                    <nav className="flex-1 px-4 py-6 space-y-3">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex items-center gap-2 px-3 py-2 rounded hover:bg-orange-500 transition"
                            >
                                {item.icon}
                                <span>{item.name}</span>
                            </Link>
                        ))}
                    </nav>
                    <button
                        onClick={logout}
                        className="bg-orange-600 py-3 flex justify-center items-center gap-2 hover:bg-orange-700 transition w-full"
                    >
                        <LogOut size={18} />
                        تسجيل الخروج
                    </button>
                </aside>

                {/* Mobile Drawer */}
                {open && (
                    <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setOpen(false)}>
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
                            <button
                                onClick={() => {
                                    setOpen(false);
                                    logout();
                                }}
                                className="mt-6 bg-orange-600 text-white rounded py-2 w-full hover:bg-orange-700 transition flex items-center justify-center gap-2"
                            >
                                <LogOut size={18} />
                                تسجيل الخروج
                            </button>
                        </aside>
                    </div>
                )}

                {/* Main Content */}
                <main className="flex-1 bg-gray-100 p-6"><AuthProvider role="student">{children}</AuthProvider></main>
            </div>
        </div>
    );
}
