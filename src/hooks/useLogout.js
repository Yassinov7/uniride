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


    try {
      await supabase.auth.signOut();
      useUserStore.getState().clearUser();
      localStorage.removeItem('user-store');

      router.replace('/login');
    } catch (err) {
      isLoggingOut.current = false; // تسمح بإعادة المحاولة
    }
  };

  return logout;
};

export default useLogout;
