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

            <div className="flex flex-1 min-h-0">
                {/* Sidebar - Desktop */}
                <aside className="hidden md:flex flex-col w-64 h-full bg-blue-600 text-white shadow-lg overflow-y-auto">
                    {/* العنوان */}
                    <div className="p-6 text-xl font-bold border-b border-blue-500">
                        لوحة تحكم المسؤول
                    </div>

                    {/* قائمة التنقل */}
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

                    {/* زر تسجيل الخروج */}
                    <button
                        onClick={logout}
                        className="m-4 mt-auto bg-orange-600 hover:bg-orange-700 transition-all rounded-lg py-2 w-auto flex justify-center items-center gap-2 text-sm font-semibold"
                    >
                        <LogOut size={18} />
                        تسجيل الخروج
                    </button>
                </aside>

                {/* Mobile Drawer */}
                <div
                    className={`fixed inset-0 z-40 transition-opacity duration-300 ${open ? 'bg-black/30 backdrop-blur-sm' : 'pointer-events-none opacity-0'}`}
                    onClick={() => setOpen(false)}
                >
                    <aside
                        className={`fixed top-0 left-0 w-72 h-full bg-blue-600 text-white shadow-xl transform transition-transform duration-300 z-50 overflow-y-auto ${open ? 'translate-x-0' : '-translate-x-full'}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center p-4 border-b border-blue-500">
                            <h2 className="font-bold text-xl">لوحة تحكم المسؤول</h2>
                            <button onClick={() => setOpen(false)}>
                                <X size={24} />
                            </button>
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 px-4 py-6 space-y-2">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setOpen(false)}
                                    className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-orange-500 transition-all text-sm font-medium"
                                >
                                    {item.icon}
                                    <span>{item.name}</span>
                                </Link>
                            ))}
                        </nav>

                        {/* Logout button */}
                        <button
                            onClick={() => {
                                setOpen(false);
                                logout();
                            }}
                            className="m-4 bg-orange-600 hover:bg-orange-700 transition-all rounded-lg py-2 w-auto flex justify-center items-center gap-2 text-sm font-semibold"
                        >
                            <LogOut size={18} />
                            تسجيل الخروج
                        </button>
                    </aside>
                </div>

                {/* Main Content */}
                <main className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6">
                    {children}
                </main>
            </div>
        </div>

    );
}