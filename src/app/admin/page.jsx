'use client';

import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';
import {
    University,
    Bus,
    HomeIcon,
    Route,
    BadgeDollarSign,
    Inbox,
    Users,
    BusFront,
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

dayjs.locale('ar');

const navItems = [
    { name: 'طلبات الحجز', href: '/admin/requests', icon: <Route size={28} /> },
    { name: 'إدارة الرحلات', href: '/admin/manage', icon: <BusFront size={28} /> },
    { name: 'رحلات الذهاب', href: '/admin/rides/creatego', icon: <Route size={28} /> },
    { name: 'رحلات العودة', href: '/admin/rides/createreturn', icon: <Route size={28} /> },
    { name: 'سجل الطلاب', href: '/admin/users', icon: <Users size={28} /> },
    { name: 'ارصدة الطلاب', href: '/admin/wallets', icon: <BadgeDollarSign size={28} /> },
    { name: 'سجل المعاملات', href: '/admin/wallets/history', icon: <Inbox size={28} /> },
    { name: 'الباصات', href: '/admin/buses', icon: <Bus size={28} /> },
    { name: 'المناطق السكنية', href: '/admin/locations', icon: <HomeIcon size={28} /> },
    { name: 'الجامعات', href: '/admin/universities', icon: <University size={28} /> },
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
            <div className="text-center space-y-2 bg-blue-50 border border-blue-200 p-4 rounded-lg shadow-sm">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-blue-700 flex justify-center items-center gap-2">
                    أهلاً بك يا {fullName || 'مشرف'} 👋</h1>
                <p className="text-gray-700 text-base sm:text-lg font-medium">
                    {dateTime.format('dddd، D MMMM YYYY')} - الساعة {dateTime.format('hh:mm')}
                </p>
            </div>

            {/* روابط لوحة التحكم */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {navItems.map((item, idx) => (
                    <Link
                        key={idx}
                        href={item.href}
                        className="group bg-white border border-gray-200 rounded-xl shadow-md p-4 flex flex-col items-center justify-center text-center transition-all hover:shadow-lg hover:border-orange-400 hover:bg-orange-50"
                    >
                        <div className="bg-blue-100 group-hover:bg-orange-500 text-blue-700 group-hover:text-white rounded-full p-3 transition-all mb-2">
                            {item.icon}
                        </div>
                        <span className="text-sm font-semibold text-gray-700 group-hover:text-orange-700">
                            {item.name}
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
