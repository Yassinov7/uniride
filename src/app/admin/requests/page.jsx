'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Check, X, Clock } from 'lucide-react';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';
import { useLoadingStore } from '@/store/loadingStore';

dayjs.locale('ar');

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [filters, setFilters] = useState({ university: '', location: '', gender: '' });
  const { setLoading } = useLoadingStore();


  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true); // ← البداية
    try {
      const { data, error } = await supabase
        .from('ride_requests')
        .select(`
        id, date, group_id, status, created_at,
        profiles (
          full_name, gender,
          universities ( name ),
          locations ( name )
        )
      `)
        .order('created_at', { ascending: false });

      if (error) {
        toast.error('حدث خطأ أثناء جلب الطلبات');
        console.error(error);
      } else {
        setRequests(data);
      }
    } catch (err) {
      toast.error('فشل غير متوقع');
      console.error(err);
    } finally {
      setLoading(false); // ← مهما حصل، نوقف التحميل
    }
  };


  const handleAction = async (groupId, action) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('ride_requests')
        .update({ status: action })
        .eq('group_id', groupId);

      if (!error) {
        setRequests((prev) =>
          prev.map((r) => (r.group_id === groupId ? { ...r, status: action } : r))
        );
      } else {
        toast.error('فشل في تحديث الطلب');
        console.error(error);
      }
    } catch (err) {
      toast.error('حدث خطأ أثناء المعالجة');
      console.error(err);
    } finally {
      setLoading(false); // هذا هو المهم
    }
  };


  const uniqueGroups = [...new Set(requests.map((r) => r.group_id))];

  const grouped = uniqueGroups.map((groupId) => {
    const groupRequests = requests.filter((r) => r.group_id === groupId);
    const base = groupRequests[0];
    const profile = base.profiles || {};
    return {
      group_id: groupId,
      student_name: profile.full_name || 'غير معروف',
      gender: profile.gender,
      university: profile.universities?.name || '—',
      location: profile.locations?.name || '—',
      status: base.status,
      dates: groupRequests.map((r) => dayjs(r.date).format('dddd - YYYY/MM/DD')),
      created_at: base.created_at,
    };
  });

  const filtered = grouped.filter((g) =>
    (filters.university === '' || g.university === filters.university) &&
    (filters.location === '' || g.location === filters.location) &&
    (filters.gender === '' || g.gender === filters.gender)
  );

  const active = filtered.filter((g) => g.status === 'pending');
  const processed = filtered.filter((g) => g.status !== 'pending');

  const universities = [...new Set(requests.map((r) => r.profiles?.universities?.name || '—'))];
  const locations = [...new Set(requests.map((r) => r.profiles?.locations?.name || '—'))];

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <h1 className="text-xl font-bold text-blue-600">طلبات الحجز</h1>

      {/* الفلاتر */}
      <div className="grid sm:grid-cols-3 gap-4">
        <select className="p-2 border rounded" onChange={(e) => setFilters({ ...filters, university: e.target.value })}>
          <option value="">🎓 كل الجامعات</option>
          {universities.map((u) => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>
        <select className="p-2 border rounded" onChange={(e) => setFilters({ ...filters, location: e.target.value })}>
          <option value="">📍 كل المناطق</option>
          {locations.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
        <select className="p-2 border rounded" onChange={(e) => setFilters({ ...filters, gender: e.target.value })}>
          <option value="">👤 الكل</option>
          <option value="male">ذكر</option>
          <option value="female">أنثى</option>
        </select>
      </div>

      {/* الطلبات النشطة */}
      <div className="border rounded shadow overflow-x-auto">
        <h2 className="bg-blue-100 text-blue-800 px-4 py-2 font-semibold">الطلبات غير المعالجة</h2>
        <table className="min-w-full text-sm text-right">
          <thead className="bg-blue-50">
            <tr>
              <th className="px-4 py-2">الطالب</th>
              <th className="px-4 py-2 hidden sm:table-cell">الجنس</th>
              <th className="px-4 py-2 hidden sm:table-cell">الجامعة</th>
              <th className="px-4 py-2 hidden sm:table-cell">المنطقة</th>
              <th className="px-4 py-2">التواريخ</th>
              <th className="px-4 py-2">الحالة</th>
              <th className="px-4 py-2">الإجراء</th>
            </tr>
          </thead>
          <tbody>
            {active.map((g) => (
              <tr key={g.group_id} className="border-b hover:bg-blue-50">
                <td className="px-4 py-2">{g.student_name}</td>
                <td className="px-4 py-2 hidden sm:table-cell">{g.gender === 'male' ? 'ذكر' : 'أنثى'}</td>
                <td className="px-4 py-2 hidden sm:table-cell">{g.university}</td>
                <td className="px-4 py-2 hidden sm:table-cell">{g.location}</td>
                <td className="px-4 py-2 text-xs">{g.dates.join(', ')}</td>
                <td className="px-4 py-2 text-orange-600 font-semibold"><Clock size={14} className="inline" /> قيد الانتظار</td>
                <td className="px-4 py-2 space-x-1">
                  <button
                    onClick={() => handleAction(g.group_id, 'approved')}
                    className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700"
                  >
                    <Check size={12} className="inline" /> قبول
                  </button>
                  <button
                    onClick={() => handleAction(g.group_id, 'rejected')}
                    className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
                  >
                    <X size={12} className="inline" /> رفض
                  </button>
                </td>
              </tr>
            ))}
            {active.length === 0 && (
              <tr><td colSpan={7} className="text-center py-4 text-gray-500">لا يوجد طلبات حالياً</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* الطلبات المعالجة */}
      <div className="border rounded shadow overflow-x-auto">
        <h2 className="bg-orange-100 text-orange-800 px-4 py-2 font-semibold">الطلبات المعالجة</h2>
        <table className="min-w-full text-sm text-right">
          <thead className="bg-orange-50">
            <tr>
              <th className="px-4 py-2">الطالب</th>
              <th className="px-4 py-2 hidden sm:table-cell">الجنس</th>
              <th className="px-4 py-2 hidden sm:table-cell">الجامعة</th>
              <th className="px-4 py-2 hidden sm:table-cell">المنطقة</th>
              <th className="px-4 py-2">التواريخ</th>
              <th className="px-4 py-2">الحالة</th>
            </tr>
          </thead>
          <tbody>
            {processed.map((g) => (
              <tr key={g.group_id} className="border-b hover:bg-orange-50">
                <td className="px-4 py-2">{g.student_name}</td>
                <td className="px-4 py-2 hidden sm:table-cell">{g.gender === 'male' ? 'ذكر' : 'أنثى'}</td>
                <td className="px-4 py-2 hidden sm:table-cell">{g.university}</td>
                <td className="px-4 py-2 hidden sm:table-cell">{g.location}</td>
                <td className="px-4 py-2 text-xs">{g.dates.join(', ')}</td>
                <td className="px-4 py-2 font-semibold">
                  {g.status === 'approved'
                    ? <span className="text-green-600"><Check size={14} className="inline" /> مقبول</span>
                    : <span className="text-red-600"><X size={14} className="inline" /> مرفوض</span>}
                </td>
              </tr>
            ))}
            {processed.length === 0 && (
              <tr><td colSpan={6} className="text-center py-4 text-gray-500">لا يوجد نتائج</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
