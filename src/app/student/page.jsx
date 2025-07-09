'use client';

import { useLoadingStore } from '@/store/loadingStore';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';
import {
    Bus,
    FileUp,
    FileDown,
    ReceiptTextIcon,
    BadgeDollarSign,
    Inbox,
    UserCircle2,
    FileWarning
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
    const [fullName, setFullName] = useState('');
    const [needsWallet, setNeedsWallet] = useState(false);
    const [needsProfileUpdate, setNeedsProfileUpdate] = useState(false);
    const { setLoading } = useLoadingStore();

    useEffect(() => {
        const interval = setInterval(() => setDateTime(dayjs()), 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const fetchInfo = async () => {
            setLoading(true); // 👈 بدء التحميل

            try {
                const { data: userData } = await supabase.auth.getUser();
                const userId = userData?.user?.id;
                if (!userId) return;

                const { data: profile } = await supabase
                    .from('profiles')
                    .select('full_name, university_id, location_id, gender')
                    .eq('id', userId)
                    .single();

                if (profile?.full_name) setFullName(profile.full_name);

                if (!profile?.university_id || !profile?.location_id || !profile?.gender) {
                    setNeedsProfileUpdate(true);
                }

                const { data: wallet } = await supabase
                    .from('wallets')
                    .select('student_id, balance')
                    .eq('student_id', userId)
                    .single();

                if (!wallet || wallet.balance < 0) {
                    setNeedsWallet(true);
                }
            } finally {
                setLoading(false); // ✅ انتهاء التحميل
            }
        };

        fetchInfo();
    }, []);


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
                            <Link
                                href="/student/wallet"
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
                            <Link
                                href="/student/profile"
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
                <h1 className="text-2xl sm:text-3xl font-extrabold text-blue-700 flex justify-center items-center gap-2">
                    👋 مرحباً {fullName || 'عزيزي الطالب'}
                </h1>
                <p className="text-gray-700 text-base sm:text-lg font-medium">
                    {dateTime.format('dddd، D MMMM YYYY')} – الساعة {dateTime.format('hh:mm')}
                </p>
            </div>


            {/* روابط التنقل */}
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
