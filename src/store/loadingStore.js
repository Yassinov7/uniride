import { create } from 'zustand';
import toast from 'react-hot-toast';

export const useLoadingStore = create((set) => {
  let timeoutId = null;

  return {
    isLoading: false,
    setLoading: (val) => {
      if (val) {
        if (timeoutId) clearTimeout(timeoutId);

        // تايمر تلقائي بعد 30 ثواني
        timeoutId = setTimeout(() => {
          set({ isLoading: false });
          timeoutId = null;
          toast.error('انتهى الوقت المخصص للتحميل. تأكد من الاتصال.');
        }, 30000);
      } else {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = null;
      }

      set({ isLoading: val });
    },
  };
});
