'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';
import { supabase } from '@/lib/supabase';
import { BusFront } from 'lucide-react';

export default function AuthRedirect() {
    const router = useRouter();
    const { user, setUser } = useUserStore();

    useEffect(() => {
        const checkAndRedirect = async () => {
            const { data } = await supabase.auth.getSession();
            const session = data.session;
            const userId = session?.user?.id;

            if (!userId) {
                router.replace('/login');
                return;
            }

            let { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (!profile) {


                if (insertError) {
                    console.error('لا يوجد ملف شخصي لك: ', insertError);
                    router.replace('/login');
                    return;
                }
            }

            setUser(profile);


            if (profile.role === 'admin') {
                router.replace('/admin');
            } else {
                router.replace('/student');
            }

        };

        if (!user) {
            const timeout = setTimeout(() => {
                checkAndRedirect();
            }, 100); // تأخير بدء العملية بـ 1 ثانية

            return () => clearTimeout(timeout);
        }
    }, [user]);


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
