'use client';

import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';
import {
    LayoutDashboard,
    Bus,
    FileUp,
    FileDown,
    ReceiptTextIcon,
    BadgeDollarSign,
    Inbox,
    UserCircle2,
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

dayjs.locale('ar');

const navItems = [
    { name: 'الحجز', href: '/student/request', icon: <Bus size={20} /> },
    { name: 'رحلة الذهاب', href: '/student/bookings', icon: <FileUp size={20} /> },
    { name: 'رحلة العودة', href: '/student/return', icon: <FileDown size={20} /> },
    { name: 'سجل الرحلات', href: '/student/bookinghistory', icon: <ReceiptTextIcon size={20} /> },
    { name: 'رصيدي', href: '/student/wallet', icon: <BadgeDollarSign size={20} /> },
    { name: 'فواتيري', href: '/student/wallet/history', icon: <Inbox size={20} /> },
    { name: 'البيانات الشخصية', href: '/student/profile', icon: <UserCircle2 size={20} /> },
];

export default function StudentHomePage() {
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
        <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded-lg shadow space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-blue-700">مرحباً {fullName || 'عزيزي الطالب'} 👋</h1>
                <p className="text-gray-600 text-lg">
                    {dateTime.format('dddd، D MMMM YYYY')} - الساعة {dateTime.format('hh:mm')}
                </p>
            </div>

            <div className="grid  grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {navItems.map((item, idx) => (
                    <Link
                        key={idx}
                        href={item.href}
                        className="flex items-center text-blue-500   justify-center gap-2 p-4 border border-blue-500 rounded-lg shadow hover:bg-orange-400 hover:text-white transition"
                    >
                        {item.icon}
                        <span className="font-medium  hover:text-white">{item.name}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
