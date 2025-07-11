'use client';

import { useUserStore } from '@/store/userStore';
import { useLoadingStore } from '@/store/loadingStore';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';
import {
    Bus, FileUp, FileDown, ReceiptTextIcon, BadgeDollarSign, Inbox, UserCircle2, FileWarning, Phone, MessageCircleDashed
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

dayjs.locale('ar');

const navItems = [
    { name: 'الحجز', href: '/student/request', icon: <Bus size={28} /> },
    { name: 'رحلاتي', href: '/student/next', icon: <FileUp size={28} /> },
    { name: 'رحلة العودة', href: '/student/return', icon: <FileDown size={28} /> },
    { name: 'سجل الرحلات', href: '/student/history', icon: <ReceiptTextIcon size={28} /> },
    { name: 'رصيدي', href: '/student/wallet', icon: <BadgeDollarSign size={28} /> },
    { name: 'فواتيري', href: '/student/wallet/history', icon: <Inbox size={28} /> },
    { name: 'البيانات الشخصية', href: '/student/profile', icon: <UserCircle2 size={28} /> },
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
                // تحقق من البيانات الشخصية
                if (!user.university_id || !user.location_id || !user.gender) {
                    setNeedsProfileUpdate(true);
                }

                // تحقق من الرصيد
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
        <div className="max-w-5xl mx-auto mt-8 p-6 bg-white rounded-lg shadow space-y-10" dir="rtl">

            {/* ✅ تنبيه إرشادي للطالب */}
            {(needsWallet || needsProfileUpdate) && (
                <div className="bg-yellow-50 border border-yellow-400 rounded-lg p-4 shadow flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-yellow-800 font-semibold text-lg">
                        <span className="animate-pulse text-yellow-500"><FileWarning size={26} /></span>
                        نرجو منك إتمام الخطوات التالية لتفعيل حسابك بالكامل، وتتمكن من الحجز.
                    </div>

                    {needsWallet && (
                        <div className="bg-white border border-yellow-300 rounded-md p-4 shadow-sm text-center">
                            <p className="text-sm text-gray-800 mb-3">
                                قم بزيارة صفحة <strong>رصيدي</strong> لتفقد رصيدك
                            </p>
                            <Link href="/student/wallet"
                                className="inline-flex items-center gap-1 bg-yellow-500 hover:bg-yellow-600 text-white text-sm px-4 py-2 rounded transition"
                            >
                                <BadgeDollarSign size={20} /> الذهاب لرصيدي
                            </Link>
                        </div>
                    )}

                    {needsProfileUpdate && (
                        <div className=" bg-white border border-yellow-300 rounded-md p-4 shadow-sm text-center">
                            <p className="text-sm text-gray-800 mb-3">
                                معلوماتك الشخصية غير مكتملة. يُرجى إدخال البيانات الناقصة .
                            </p>
                            <Link href="/student/profile"
                                className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded transition"
                            >
                                <UserCircle2 size={20} /> الملف الشخصي
                            </Link>
                        </div>
                    )}
                </div>
            )}

            {/* 👋 الترحيب */}
            <div className="text-center space-y-2 bg-blue-50 border border-blue-200 p-4 rounded-lg shadow-sm">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-700 flex justify-center items-center gap-2">
                    👋 مرحباً {user?.full_name || 'عزيزي الطالب'}
                </h2>
                <p className="text-gray-700 text-base sm:text-lg font-medium">
                    {dateTime.format('dddd، D MMMM YYYY')} – الساعة {dateTime.format('hh:mm')}
                </p>
            </div>

            {/* تواصل مع المشرف */}
            <div className="mt-6">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 shadow flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-bold text-blue-800 mb-1 flex items-center gap-2">🧑‍💼 تواصل مع المشرف</h2>
                        <p className="text-sm text-gray-700">لأي استفسار أو مساعدة، لا تتردد في التواصل معنا مباشرة.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <a href="tel:+963984872471"
                            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                        >
                            <Phone size={18} /> الاتصال الآن
                        </a>

                        <a href={`https://wa.me/963984872471?text=${encodeURIComponent("مرحبًا، أود الاستفسار عن.. ")}`}
                            target="_blank"
                            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                        >
                            <MessageCircleDashed size={18} /> واتساب
                        </a>
                    </div>
                </div>
            </div>

            {/* روابط التنقل */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {navItems.map((item, idx) => (
                    <Link key={idx} href={item.href}
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
