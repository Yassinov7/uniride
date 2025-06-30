'use client';

import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';
import {
    LayoutDashboard,
    University,
    Bus,
    HomeIcon,
    Route,
    BadgeDollarSign,
    Inbox,
    Users,
    FileDown,
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

dayjs.locale('ar');

const navItems = [
    { name: 'الصفحة الرئيسية', href: '/admin', icon: <LayoutDashboard size={28} /> },
    { name: 'الجامعات', href: '/admin/universities', icon: <University size={28} /> },
    { name: 'الباصات', href: '/admin/buses', icon: <Bus size={28} /> },
    { name: 'المناطق السكنية', href: '/admin/locations', icon: <HomeIcon size={28} /> },
    { name: 'طلبات الحجز', href: '/admin/requests', icon: <Route size={28} /> },
    { name: 'ارصدة الطلاب', href: '/admin/wallets', icon: <BadgeDollarSign size={28} /> },
    { name: 'سجل المعاملات', href: '/admin/wallets/history', icon: <Inbox size={28} /> },
    { name: 'رحلات الذهاب', href: '/admin/rides/creatego', icon: <Route size={28} /> },
    { name: 'رحلات العودة', href: '/admin/rides/createreturn', icon: <Route size={28} /> },
    { name: 'سجل الطلاب', href: '/admin/users', icon: <Users size={28} /> },
    { name: 'تصدير البيانات', href: '/admin/export', icon: <FileDown size={28} /> },
];

export default function AdminHomePage() {
    const [dateTime, setDateTime] = useState(dayjs());
    const [fullName, setFullName] = useState('');

    useEffect(() => {
        const interval = setInterval(() => setDateTime(dayjs()), 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const fetchName = async () => {
            const { data: userData } = await supabase.auth.getUser();
            const userId = userData?.user?.id;

            if (!userId) return;

            const { data } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', userId)
                .single();

            if (data?.full_name) {
                setFullName(data.full_name);
            }
        };

        fetchName();
    }, []);

    return (
        <div className="max-w-6xl mx-auto mt-8 p-6 bg-white rounded-lg shadow space-y-10" dir="rtl">
            {/* العنوان والترحيب */}
            <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-blue-700">أهلاً بك يا {fullName || 'مشرف'} 👋</h1>
                <p className="text-gray-600 text-lg">
                    {dateTime.format('dddd، D MMMM YYYY')} - الساعة {dateTime.format('hh:mm')}
                </p>
            </div>

            {/* روابط لوحة التحكم */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {navItems.map((item, idx) => (
                    <Link
                        key={idx}
                        href={item.href}
                        className="flex flex-col items-center justify-center gap-2 p-4 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl hover:bg-orange-500 hover:text-white transition text-center shadow-sm"
                    >
                        {item.icon}
                        <span className="text-sm font-semibold">{item.name}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
