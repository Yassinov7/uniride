'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/store/userStore';

export default function AuthProvider({ children, role }) {
    const router = useRouter();
    const { user, setUser } = useUserStore();

    useEffect(() => {
        const loadUser = async () => {
            // ✅ تجنب استخدام 'session' كاسم أثناء التفكيك
            const { data } = await supabase.auth.getSession();
            const session = data.session;
            const userId = session?.user?.id;
            
            if (!userId) {
                router.push('/login');
                return;
            }

            if (user && user.id === userId) return;

            let { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            // إذا لم يوجد، أنشئه
            if (!profile || error) {
                const defaultRole = role || 'student';
                const { data: newProfile, error: insertError } = await supabase
                    .from('profiles')
                    .insert({ id: userId, role: defaultRole })
                    .select()
                    .single();

                if (!newProfile || insertError) {
                    console.error('فشل إنشاء الحساب:', insertError);
                    router.push('/login');
                    return;
                }

                profile = newProfile;
            }

            // تحقق من الدور
            if (role && profile.role !== role) {
                router.replace('/unauthorized');
                return;
            }

            setUser(profile);
        };

        loadUser();
    }, []);

    return children;
}
