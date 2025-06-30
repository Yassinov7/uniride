'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';
import { supabase } from '@/lib/supabase';
import { BusFront } from 'lucide-react';

export default function AuthRedirect() {
    const router = useRouter();
    const { setUser } = useUserStore();

    useEffect(() => {
        const checkAndRedirect = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (!session) {
                router.push('/login');
                return;
            }

            const userId = session.user.id;

            let { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (!profile) {
                const { data: newProfile, error: insertError } = await supabase
                    .from('profiles')
                    .insert({ id: userId, role: 'student' })
                    .select()
                    .single();

                if (insertError) {
                    console.error(insertError);
                    router.push('/login');
                    return;
                }

                profile = newProfile;
            }

            setUser(profile);

            if (profile.role === 'admin') {
                router.push('/admin');
            } else {
                router.push('/student');
            }
        };

        checkAndRedirect();
    }, [router, setUser]);

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
