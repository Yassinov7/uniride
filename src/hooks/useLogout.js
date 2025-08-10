import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';
import toast from 'react-hot-toast';
import { useRef } from 'react';

const useLogout = () => {
  const router = useRouter();
  const isLoggingOut = useRef(false);

  const logout = async () => {
    if (isLoggingOut.current) return;
    isLoggingOut.current = true;

    
    const toastId = toast.loading('جاري تسجيل الخروج...');

    try {
      await supabase.auth.signOut();
      useUserStore.getState().clearUser();
      localStorage.removeItem('user-store');

      router.replace('/login');
      toast.success('تم تسجيل الخروج بنجاح', { id: toastId });
    } catch (err) {
      toast.error('فشل تسجيل الخروج، حاول مجددًا', { id: toastId });
      isLoggingOut.current = false;
    }
  };

  return logout;
};

export default useLogout;
