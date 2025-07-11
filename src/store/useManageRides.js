import { create } from 'zustand';
import dayjs from 'dayjs';
import { supabase } from '@/lib/supabase';
// import { useUserStore } from '@/store/userStore';
// import Swal from 'sweetalert2';


export const useManageRideStore = create((set, get) => ({

    date: dayjs().format('YYYY-MM-DD'),
    setDate: (date) => set({ date }),

    routeType: 'go',
    setRouteType: (type) => set({ routeType: type }),

    rides: [], // ← مهم جدًا
    isLoading: false,

    fetchRides: async () => {
        const { rides } = get();
        if (rides.length > 0) return; // لا تجلب إذا كانت موجودة
        console.log("erg")
        set({ isLoading: true });

        const { data: ridesData } = await supabase
            .from('rides')
            .select('id, date, time, route_type, buses(name)');

        const ridesWithStudents = await Promise.all(
            (ridesData || []).map(async (ride) => {
                const { data: students } = await supabase
                    .from('ride_students')
                    .select('student_id, profiles(full_name)')
                    .eq('ride_id', ride.id);

                return {
                    ...ride,
                    ride_students: students || [],
                };
            })
        );

        set({
            rides: ridesWithStudents,
            isLoading: false
        });
    },
    // ✅ دالة حذف الطالب من الرحلة
    // handleRemoveStudent: async (student) => {
        
    //     const { selectedRide, fetchRides, setSelectedRide } = get();
    //     const { user } = useUserStore.getState();

    //     const result = await Swal.fire({
    //         title: 'تأكيد الإزالة',
    //         text: `هل تريد إزالة ${student.profiles?.full_name} من الرحلة؟`,
    //         icon: 'warning',
    //         showCancelButton: true,
    //         confirmButtonText: 'نعم، احذف',
    //         cancelButtonText: 'إلغاء',
    //         input: 'checkbox',
    //         inputPlaceholder: 'استرجاع الرصيد تلقائيًا للطالب',
    //     });

    //     if (!result.isConfirmed) return;

    //     set({ isLoading: true });
    //     const shouldRefund = result.value === 1;

    //     try {
    //         // حذف الطالب من الرحلة
    //         const { error: removeError } = await supabase
    //             .from('ride_students')
    //             .delete()
    //             .eq('ride_id', selectedRide.id)
    //             .eq('student_id', student.student_id);

    //         if (removeError) {
    //             toast.error('❌ فشل في إزالة الطالب من الرحلة');
    //             return;
    //         }

    //         // تحديث الحالة حسب نوع الرحلة
    //         if (selectedRide.route_type === 'go') {
    //             await supabase
    //                 .from('ride_requests')
    //                 .update({ status: 'approved' })
    //                 .eq('student_id', student.student_id)
    //                 .eq('date', selectedRide.date);
    //         } else {
    //             await supabase
    //                 .from('return_candidates')
    //                 .update({ assigned: false })
    //                 .eq('student_id', student.student_id)
    //                 .eq('date', selectedRide.date);
    //         }

    //         // استرداد الرصيد
    //         if (shouldRefund) {
    //             const { data: profile } = await supabase
    //                 .from('profiles')
    //                 .select('location_id')
    //                 .eq('id', student.student_id)
    //                 .single();

    //             const { data: location } = await supabase
    //                 .from('locations')
    //                 .select('fare')
    //                 .eq('id', profile?.location_id)
    //                 .single();

    //             const fare = +location?.fare || 0;

    //             const { data: wallet } = await supabase
    //                 .from('wallets')
    //                 .select('balance')
    //                 .eq('student_id', student.student_id)
    //                 .single();

    //             if (wallet) {
    //                 await supabase
    //                     .from('wallets')
    //                     .update({ balance: wallet.balance + fare })
    //                     .eq('student_id', student.student_id);
    //             }

    //             await supabase.from('wallet_transactions').insert({
    //                 student_id: student.student_id,
    //                 amount: fare,
    //                 description: 'إستعادة الرصيد بعد إزالة من الرحلة',
    //                 created_by: user?.full_name,
    //             });
    //         }

    //         toast.success('✅ تم الحذف' + (shouldRefund ? ' مع استرداد الرصيد' : ''));
    //         await fetchRides();
    //         setSelectedRide(null);
    //     } catch (err) {
    //         console.error(err);
    //         toast.error('❌ فشل غير متوقع أثناء الحذف');
    //     } finally {
    //         set({ isLoading: false });
    //     }
    // },


    selectedRide: null,
    setSelectedRide: (ride) => set({ selectedRide: ride }),

    studentToMove: null,
    setStudentToMove: (student) => set({ studentToMove: student }),

    availableRides: [],
    setAvailableRides: (rides) => set({ availableRides: rides }),

    showAddModal: false,
    setShowAddModal: (show) => set({ showAddModal: show }),

    availableStudents: [],
    setAvailableStudents: (students) => set({ availableStudents: students }),
}));
