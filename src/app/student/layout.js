'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/store/userStore';
import { useLoadingStore } from '@/store/loadingStore';
import useLogout from '@/hooks/useLogout';
import CommonHeader from '@/components/CommonHeader';

import {
    X, LayoutDashboard, FileDown, BadgeDollarSign, Bus, Inbox,
    UserCircle2, FileUp, ReceiptTextIcon, LogOut
} from 'lucide-react';

const navItems = [
    { name: 'الصفحة الرئيسية', href: '/student', icon: <LayoutDashboard size={20} /> },
    { name: 'الحجز', href: '/student/request', icon: <Bus size={20} /> },
    { name: 'رحلاتي', href: '/student/next', icon: <FileUp size={20} /> },
    { name: 'رحلة العودة', href: '/student/return', icon: <FileDown size={20} /> },
    { name: 'سجل الرحلات', href: '/student/history', icon: <ReceiptTextIcon size={20} /> },
    { name: 'رصيدي', href: '/student/wallet', icon: <BadgeDollarSign size={20} /> },
    { name: 'فواتيري', href: '/student/wallet/history', icon: <Inbox size={20} /> },
    { name: 'البيانات الشخصية', href: '/student/profile', icon: <UserCircle2 size={20} /> },
];

export default function StudentLayout({ children }) {
    const [open, setOpen] = useState(false);
    const { setLoading } = useLoadingStore();
    const router = useRouter();
    const logout = useLogout();
    const { user, setUser } = useUserStore();

    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true);
            const { data } = await supabase.auth.getSession();
            const session = data.session;
            const userId = session?.user?.id;

            if (!userId) {
                router.replace('/login');
                return;
            }

            if (user && user.id === userId) {
                setLoading(false);
                return;
            }

            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            // ❌ إذا لم يوجد، لا تنشئه
            if (!profile || error) {
                router.replace('/login');
                setLoading(false);
                return;
            }

            // ✅ تحقق من الدور
            if (profile.role !== 'student') {
                router.replace('/unauthorized');
                setLoading(false);
                return;
            }

            setUser(profile);
            setLoading(false);
        };

        fetchUser();
    }, []);

    return (
        <div className="flex flex-col min-h-screen bg-gray-100" dir="rtl">
            <CommonHeader onMenuClick={() => setOpen(true)} />

            <div className="flex flex-1">
                {/* Sidebar - Desktop */}
                <aside className="hidden md:flex flex-col w-64 bg-blue-600 text-white shadow-lg">
                    <div className="p-6 text-xl font-bold border-b border-blue-500">
                        منطقة الطالب
                    </div>

                    <nav className="flex-1 px-4 py-6 space-y-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-orange-500 transition-all text-sm font-medium"
                            >
                                {item.icon}
                                <span>{item.name}</span>
                            </Link>
                        ))}
                    </nav>

                    <button
                        onClick={logout}
                        className="m-4 mt-auto bg-orange-600 hover:bg-orange-700 transition-all rounded-lg py-2 w-auto flex justify-center items-center gap-2"
                    >
                        <LogOut size={18} />
                        تسجيل الخروج
                    </button>
                </aside>

                {/* Mobile Drawer */}
                <div
                    className={`fixed inset-0 z-40 transition-opacity duration-300 ${open ? 'bg-black/30 backdrop-blur-sm' : 'pointer-events-none opacity-0'
                        }`}
                    onClick={() => setOpen(false)}
                >
                    <aside
                        className={`fixed top-0 left-0 h-full w-72 bg-blue-600 text-white shadow-xl transform transition-transform duration-300 z-50 ${open ? 'translate-x-0' : '-translate-x-full'
                            }`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center p-4 border-b border-blue-500">
                            <h2 className="font-bold text-lg">القائمة</h2>
                            <button onClick={() => setOpen(false)}>
                                <X size={24} />
                            </button>
                        </div>

                        <nav className="flex-1 px-4 py-6 space-y-3">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setOpen(false)}
                                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-orange-500 transition text-sm font-medium"
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
                            className="m-4 bg-orange-600 hover:bg-orange-700 transition-all rounded-lg py-2 w-auto flex justify-center items-center gap-2"
                        >
                            <LogOut size={18} />
                            تسجيل الخروج
                        </button>
                    </aside>
                </div>

                {/* Main Content */}
                <main className="flex-1 p-4 sm:p-6">{children}</main>
            </div>
        </div>
    );
}
