'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUserStore } from '@/store/userStore';
import { useLoadingStore } from '@/store/loadingStore';
import { supabase } from '@/lib/supabase';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';

import {
    Bus, FileUp, FileDown, ReceiptTextIcon,
    BadgeDollarSign, Inbox, UserCircle2,
    FileWarning, Phone, MessageCircleDashed
} from 'lucide-react';

dayjs.locale('ar');

const navLinks = [
    { name: 'الحجز', href: '/student/request', icon: <Bus size={22} /> },
    { name: 'رحلاتي', href: '/student/next', icon: <FileUp size={22} /> },
    // { name: 'رحلة العودة', href: '/student/return', icon: <FileDown size={22} /> },
    { name: 'سجل الرحلات', href: '/student/history', icon: <ReceiptTextIcon size={22} /> },
    { name: 'رصيدي', href: '/student/wallet', icon: <BadgeDollarSign size={22} /> },
    { name: 'فواتيري', href: '/student/wallet/history', icon: <Inbox size={22} /> },
    { name: 'البيانات الشخصية', href: '/student/profile', icon: <UserCircle2 size={22} /> },
];

export default function StudentHomePage() {
    const [dateTime, setDateTime] = useState(dayjs());
    const [needsWallet, setNeedsWallet] = useState(false);
    const [needsProfileUpdate, setNeedsProfileUpdate] = useState(false);
    const { user } = useUserStore();
    const { setLoading } = useLoadingStore();

    useEffect(() => {
        const interval = setInterval(() => setDateTime(dayjs()), 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!user?.id) return;

        const checkStatus = async () => {
            setLoading(true);
            try {
                if (!user.university_id || !user.location_id || !user.gender) {
                    setNeedsProfileUpdate(true);
                }

                const { data: wallet } = await supabase
                    .from('wallets')
                    .select('balance')
                    .eq('student_id', user.id)
                    .single();

                if (!wallet || wallet.balance < 0) {
                    setNeedsWallet(true);
                }
            } finally {
                setLoading(false);
            }
        };

        checkStatus();
    }, [user]);

    return (
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-8" dir="rtl">
            {/* ✅ التنبيه */}
            {(needsWallet || needsProfileUpdate) && (
                <div className="bg-yellow-50 border border-yellow-300 p-4 rounded-lg shadow space-y-4">
                    <div className="flex items-center gap-2 text-yellow-800 font-semibold text-lg">
                        <FileWarning className="text-yellow-500 animate-pulse" size={24} />
                        يرجى إتمام الخطوات التالية لتفعيل الحساب:
                    </div>

                    {needsWallet && (
                        <div className="p-3 bg-white border rounded-md text-center space-y-2">
                            <p className="text-sm text-gray-700">قم بتفقد رصيدك لتتمكن من الحجز.</p>
                            <Link href="/student/wallet" className="inline-block bg-yellow-500 hover:bg-yellow-600 text-white text-sm px-4 py-2 rounded transition">
                                الذهاب إلى رصيدي
                            </Link>
                        </div>
                    )}

                    {needsProfileUpdate && (
                        <div className="p-3 bg-white border rounded-md text-center space-y-2">
                            <p className="text-sm text-gray-700">يرجى استكمال بياناتك الشخصية.</p>
                            <Link href="/student/profile" className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded transition">
                                الملف الشخصي
                            </Link>
                        </div>
                    )}
                </div>
            )}

            {/* 👋 الترحيب */}
            <div className="text-center space-y-1 bg-blue-100 border border-blue-200 p-5 rounded-lg shadow">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-blue-700">
                    👋 مرحباً {user?.full_name || 'عزيزي الطالب'}
                </h1>
                <p className="text-gray-700 font-medium">
                    {dateTime.format('dddd، D MMMM YYYY')} – الساعة {dateTime.format('hh:mm A')}
                </p>
            </div>

            {/* 📞 التواصل */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 flex flex-col sm:flex-row justify-between items-center gap-4 shadow">
                <div className="space-y-1">
                    <h2 className="font-bold text-blue-800 text-lg">🧑‍💼 تواصل مع المشرف</h2>
                    <p className="text-sm text-gray-600">نحن هنا للمساعدة! تواصل مباشرة في أي وقت.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <a href="tel:+963984872471"
                        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition w-full sm:w-auto"
                    >
                        <Phone size={18} /> الاتصال
                    </a>
                    <a
                        href={`https://wa.me/963984872471?text=${encodeURIComponent("مرحبًا، أود الاستفسار عن.. ")}`}
                        target="_blank"
                        className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition w-full sm:w-auto"
                    >
                        <MessageCircleDashed size={18} /> واتساب
                    </a>
                </div>
            </div>

            {/* 🧭 التنقل */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {navLinks.map((link, index) => (
                    <Link key={index} href={link.href}
                        className="group flex flex-col items-center justify-center gap-2 p-4 bg-white border border-gray-200 rounded-xl shadow hover:shadow-lg hover:bg-orange-50 hover:border-orange-400 transition"
                    >
                        <div className="p-3 rounded-full bg-blue-100 group-hover:bg-orange-500 text-blue-700 group-hover:text-white transition">
                            {link.icon}
                        </div>
                        <span className="text-sm font-semibold text-gray-700 group-hover:text-orange-700 transition">
                            {link.name}
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
