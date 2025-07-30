'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { BadgeDollarSign, Info, RotateCcw, Phone, MessageCircleDashed } from 'lucide-react';
import { useWalletStore } from '@/store/walletStore';
import { useUserStore } from '@/store/userStore';

export default function StudentWalletPage() {
    const { balance, setBalance, loaded, setLoaded } = useWalletStore();
    const { user } = useUserStore();
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (!user?.id || loaded) return;
        fetchBalance();
    }, []);

    // const fetchBalance = async () => {
    //     setRefreshing(true);

    //     const userId = user?.id;
    //     if (!userId) {
    //         setRefreshing(false);
    //         return;
    //     }

    //     const { data: existing, error } = await supabase
    //         .from('wallets')
    //         .select('balance')
    //         .eq('student_id', userId)
    //         .maybeSingle();

    //     if (!existing) {
    //         await supabase.from('wallets').insert({ student_id: userId, balance: 0 });
    //         setBalance(0);
    //     } else {
    //         setBalance(existing.balance ?? 0);
    //     }

    //     setLoaded(true);
    //     setRefreshing(false);
    // };
    const fetchBalance = async () => {
        setRefreshing(true);

        const userId = user?.id;
        if (!userId) {
            setRefreshing(false);
            return;
        }

        const { data: existing, error } = await supabase
            .from('wallets')
            .select('balance')
            .eq('student_id', userId)
            .maybeSingle();

        if (existing) {
            setBalance(existing.balance ?? 0);
        } else {
            // المحفظة غير موجودة، نعرض الرصيد 0 أو رسالة تنبيه
            setBalance(0);
        }

        setLoaded(true);
        setRefreshing(false);
    };

    return (
        <div className="max-w-md mx-auto mt-10 bg-white rounded-xl shadow p-6 text-center space-y-6 mb-60">
            <div className="flex justify-between items-center">
                <h1 className="text-xl font-bold text-blue-600 flex items-center gap-2">
                    <BadgeDollarSign size={26} className="text-blue-600" />
                    رصيدك الحالي
                </h1>

                <button
                    onClick={() => {
                        setLoaded(false);
                        fetchBalance();
                    }}
                    disabled={refreshing}
                    className="flex items-center gap-1 text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
                >
                    <RotateCcw size={16} className={refreshing ? 'animate-spin' : ''} />
                    {refreshing ? 'جاري التحديث...' : 'تحديث'}
                </button>
            </div>

            <p className={`text-4xl font-extrabold ${balance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                {balance} ل.س
            </p>

            {/* ملاحظة عن الرصيد */}
            <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-gray-800">
                <Info size={18} className="text-yellow-500 mt-1" />
                <div>
                    <p className="font-semibold">تنويه:</p>
                    <p>رصيدك يتم تحديثه -دفع اقساط أو خصومات- بواسطة <span className="font-bold text-blue-700">المشرف</span> بعد تأكيد الحجز أو إعادة المبلغ.</p>
                </div>
            </div>

            {/* تواصل مع المشرف */}
            <div className="mt-6">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 shadow flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-bold text-blue-800 mb-1 flex items-center gap-2">
                            🧑‍💼 تواصل مع المشرف
                        </h2>
                        <p className="text-sm text-gray-700">
                            لطلب مساعدة أو استفسار بخصوص رصيدك، لا تتردد بالتواصل معنا.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <a
                            href="tel:+963984872471"
                            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                        >
                            <Phone size={18} /> الاتصال الآن
                        </a>

                        <a
                            href={`https://wa.me/963984872471?text=${encodeURIComponent("مرحبًا، أود الاستفسار عن رصيدي...")}`}
                            target="_blank"
                            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                        >
                            <MessageCircleDashed size={18} /> واتساب
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
