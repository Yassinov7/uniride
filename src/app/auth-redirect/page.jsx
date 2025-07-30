'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { BusFront } from 'lucide-react';

export default function AuthRedirect() {
    const router = useRouter();

    useEffect(() => {
        const checkAndRedirect = async () => {
            const { data } = await supabase.auth.getSession();
            const session = data.session;
            const userId = session?.user?.id;

            if (!userId) {
                router.replace('/login');
                return;
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', userId)
                .single();

            if (!profile) {
                router.replace('/login');
                return;
            }

            if (profile.role === 'admin') {
                router.replace('/admin');
            } else if (profile.role === 'student') {
                router.replace('/student');
            } else {
                router.replace('/unauthorized');
            }
        };

        checkAndRedirect();
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-blue-50 text-center p-6">
            <div className="animate-bounce text-blue-600 mb-4">
                <BusFront size={72} />
            </div>
            <h1 className="text-xl font-bold text-blue-800 mb-2">جارٍ توجيهك إلى وجهتك المناسبة</h1>
            <p className="text-gray-600">يرجى الانتظار قليلاً أثناء تحميل معلومات حسابك...</p>
        </div>
    );
}
