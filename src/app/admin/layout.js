'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/store/userStore';
import useLogout from '@/hooks/useLogout';
import CommonHeader from '@/components/CommonHeader';
import {
    X, University, Bus, Route, Users, BusFront,
    LayoutDashboard, HomeIcon, BadgeDollarSign, Inbox, LogOut
} from 'lucide-react';
import { useLoadingStore } from '@/store/loadingStore';

const navItems = [
    { name: 'الصفحة الرئيسية', href: '/admin', icon: <LayoutDashboard size={18} /> },
    { name: 'الجامعات', href: '/admin/universities', icon: <University size={18} /> },
    { name: 'الباصات', href: '/admin/buses', icon: <Bus size={18} /> },
    { name: 'المناطق السكنية', href: '/admin/locations', icon: <HomeIcon size={18} /> },
    { name: 'طلبات الحجز', href: '/admin/requests', icon: <Route size={18} /> },
    { name: 'إدارة الرحلات', href: '/admin/manage', icon: <BusFront size={18} /> },
    { name: 'رحلات الذهاب', href: '/admin/rides/creatego', icon: <Route size={18} /> },
    { name: 'رحلات العودة', href: '/admin/rides/createreturn', icon: <Route size={18} /> },
    { name: 'سجل الطلاب', href: '/admin/users', icon: <Users size={18} /> },
    { name: 'أرصدة الطلاب', href: '/admin/wallets', icon: <BadgeDollarSign size={18} /> },
    { name: 'سجل المعاملات', href: '/admin/wallets/history', icon: <Inbox size={18} /> },
];

export default function AdminLayout({ children }) {
    const [open, setOpen] = useState(false);
    const { setLoading } = useLoadingStore();
    const logout = useLogout();
    const router = useRouter();
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

            // إذا كان موجودًا بالفعل في الستور، لا حاجة لإعادة الجلب
            if (user && user.id === userId) {
                setLoading(false);
                return;
            }

            // ✅ جلب الملف الشخصي فقط (بدون إنشاء)
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            // ❌ إذا لم يوجد، لا تنشئه
            if (!profile || error) {
                router.replace('/loging');
                setLoading(false);
                return;
            }

            // ✅ تحقق من الدور
            if (profile.role !== 'admin') {
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
                    <div className="p-6 text-xl font-bold border-b border-blue-500">لوحة التحكم</div>
                    <nav className="flex-1 px-4 py-6 space-y-3 overflow-y-auto">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex items-center gap-2 px-3 py-2 rounded hover:bg-orange-500 transition text-sm"
                            >
                                {item.icon}
                                <span>{item.name}</span>
                            </Link>
                        ))}
                    </nav>
                    <button
                        onClick={logout}
                        className="flex items-center justify-center gap-2 bg-blue-700 py-3 hover:bg-orange-500 transition text-white"
                    >
                        <LogOut size={18} /> تسجيل خروج
                    </button>
                </aside>

                {/* Mobile Drawer - Left with transition */}
                <div
                    className={`fixed inset-0 z-40 transition-opacity duration-300 ${open ? 'bg-black/30 backdrop-blur-sm' : 'pointer-events-none opacity-0'
                        }`}
                    onClick={() => setOpen(false)}
                >
                    <aside
                        className={`fixed top-0 left-0 w-72 h-full bg-blue-600 text-white shadow-md z-50 transform transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'
                            }`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center p-4 border-b border-blue-400">
                            <h2 className="font-bold text-xl">القائمة</h2>
                            <button onClick={() => setOpen(false)}>
                                <X size={24} />
                            </button>
                        </div>

                        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setOpen(false)}
                                    className="flex items-center gap-2 px-3 py-2 rounded hover:bg-orange-500 transition text-sm"
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
                            className="flex items-center justify-center gap-2 bg-blue-700 py-3 hover:bg-orange-500 transition text-white"
                        >
                            <LogOut size={18} /> تسجيل خروج
                        </button>
                    </aside>
                </div>

                {/* Main Content */}
                <main className="flex-1 p-4 sm:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
