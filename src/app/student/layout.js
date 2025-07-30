'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/store/userStore';
import SidebarLink from '@/components/SidebarLink';
import { useLoadingStore } from '@/store/loadingStore';
import TransitionLoader from '@/components/TransitionLoader';
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
    { name: 'الملف الشخصي', href: '/student/profile', icon: <UserCircle2 size={20} /> },
];

export default function StudentLayout({ children }) {
    const [open, setOpen] = useState(false);
    const { setLoading } = useLoadingStore();
    const router = useRouter();
    const logout = useLogout();
    const { user, setUser } = useUserStore();
    const pathname = usePathname();
    const [gloading, setGLoading] = useState(false);

    useEffect(() => {
        // عند تغير الصفحة، أوقف اللودر
        setGLoading(false);
    }, [pathname]);
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
            if (profile.role === 'admin') {

                    router.replace('/admin');
                    setLoading(false);
                    return;
                }
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
            <TransitionLoader />
            {/* الهيدر العام */}
            <CommonHeader onMenuClick={() => setOpen(true)} />

            <div className="flex flex-1 min-h-0">
                {/* Sidebar - Desktop */}
                <aside className="hidden pb-18 md:flex flex-col w-64 h-full bg-blue-600 text-white shadow-lg overflow-y-auto">
                    <div className="p-6 text-xl font-bold border-b border-blue-500">
                        لوحة تحكم الطالب
                    </div>

                    <nav className="flex-1 px-4 py-6 space-y-2">
                        {navItems.map((item) => (
                            <SidebarLink
                                key={item.href}
                                href={item.href}
                                icon={item.icon}
                                label={item.name}
                                closeDrawer={() => setOpen(false)}
                                setGlobalLoading={setGLoading}
                            />
                        ))}
                    </nav>

                    <button
                        onClick={logout}
                        className="m-4 mt-auto bg-orange-600 hover:bg-orange-700 transition-all rounded-lg py-2 w-auto flex justify-center items-center gap-2 text-sm font-semibold"
                    >
                        <LogOut size={18} />
                        تسجيل الخروج
                    </button>
                </aside>


                {/* Mobile Sidebar */}
                <div
                    className={`fixed inset-0 z-40 transition-opacity duration-300 ${open ? 'bg-black/30 backdrop-blur-sm' : 'pointer-events-none opacity-0'}`}
                    onClick={() => setOpen(false)}
                >
                    <aside
                        className={`pb-18 fixed top-0 left-0 w-72 h-full bg-blue-600 text-white shadow-xl transform transition-transform duration-300 z-50 ${open ? 'translate-x-0' : '-translate-x-full'}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center p-4 border-b border-blue-500">
                            <h2 className="font-bold text-xl">لوحة تحكم الطالب</h2>
                            <button onClick={() => setOpen(false)}>
                                <X size={24} />
                            </button>
                        </div>

                        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                            {navItems.map((item) => (
                                <SidebarLink
                                    key={item.href}
                                    href={item.href}
                                    icon={item.icon}
                                    label={item.name}
                                    closeDrawer={() => setOpen(false)}
                                    setGlobalLoading={setGLoading}
                                />
                            ))}
                        </nav>

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
