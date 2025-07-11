'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { BadgeDollarSign } from 'lucide-react';
import { useLoadingStore } from '@/store/loadingStore';

export default function StudentWalletPage() {
    const [balance, setBalance] = useState(null);
    const { setLoading } = useLoadingStore();

    useEffect(() => {
        fetchBalance();
    }, []);

    const fetchBalance = async () => {
        setLoading(true);
        const user = await supabase.auth.getUser();
        const userId = user.data.user?.id;

        if (!userId) {
            setLoading(false);
            return;
        }

        // فحص إن كانت المحفظة موجودة
        const { data: existing, error: fetchError } = await supabase
            .from('wallets')
            .select('balance')
            .eq('student_id', userId)
            .maybeSingle();

        if (fetchError) {
            console.error(fetchError);
            setLoading(false);
            return;
        }

        if (existing === null) {
            // محاولة إنشاء سجل جديد فقط إذا لم يكن موجودًا فعلاً
            const { error: insertError } = await supabase
                .from('wallets')
                .insert({ student_id: userId, balance: 0 });

            if (insertError && insertError.code !== '23505') {
                // فقط إذا لم يكن الخطأ بسبب إدخال مكرر
                console.error(insertError);
                setLoading(false);
                return;
            }

            setBalance(0);
        } else {
            setBalance(existing.balance ?? 0);
        }

        setLoading(false);
    };


    return (
        <div className="max-w-md mx-auto mt-10 bg-white rounded-lg shadow p-6 text-center space-y-6 mb-60">
            <BadgeDollarSign size={32} className="mx-auto text-blue-600" />
            <h1 className="text-xl font-bold text-blue-600">رصيدك الحالي</h1>

            {(
                <p className={`text-3xl font-extrabold ${balance < 0 ? 'text-red-600' : 'text-orange-500'}`}>
                    {balance} ل.س
                </p>
            )}
        </div>
    );
}
