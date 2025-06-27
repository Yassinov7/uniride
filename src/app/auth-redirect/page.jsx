'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';
import { supabase } from '@/lib/supabase';

export default function AuthRedirect() {
    const router = useRouter();
    const { setUser } = useUserStore();

    useEffect(() => {
        const checkAndRedirect = async () => {
            // التحقق من جلسة المستخدم
            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (!session) {
                router.push('/login');
                return;
            }

            const userId = session.user.id;

            // التحقق من وجود سجل المستخدم في profiles
            let { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            // إذا لم يكن هناك سجل، نقوم بإنشاء سجل جديد (دور الطالب افتراضيًا)
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

            // تحديث Zustand store
            setUser(profile);

            // التوجيه حسب الدور
            if (profile.role === 'admin') {
                router.push('/admin/dashboard');
            } else {
                router.push('/student/rides');
            }
        };

        checkAndRedirect();
    }, [router, setUser]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            جاري التحقق والتوجيه...
        </div>
    );
}
