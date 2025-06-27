'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { PlusCircle, Pencil, X, Trash2 } from 'lucide-react';
import dayjs from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import weekOfYear from 'dayjs/plugin/weekOfYear';
dayjs.extend(weekday);
dayjs.extend(isSameOrBefore);
dayjs.extend(weekOfYear);

const routeOptions = [
  { value: 'go', label: 'ذهاب' },
  { value: 'return', label: 'عودة' },
];

export default function RidesPage() {
  const [rides, setRides] = useState([]);
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const [filterType, setFilterType] = useState('all');
  const [filterWeekOnly, setFilterWeekOnly] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingRide, setEditingRide] = useState(null);

  const [form, setForm] = useState({
    date: '',
    time: '',
    bus_id: '',
    route_type: 'go',
    repeat: 1,
  });

  useEffect(() => {
    fetchRides();
    fetchBuses();
  }, []);

  const fetchRides = async () => {
    const { data } = await supabase
      .from('rides')
      .select('*, buses(name)')
      .order('date', { ascending: true });
    setRides(data || []);
    setLoading(false);
  };

  const fetchBuses = async () => {
    const { data } = await supabase.from('buses').select('*').order('name');
    setBuses(data || []);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const { date, time, bus_id, route_type, repeat } = form;
    if (!date || !time || !bus_id || !route_type) {
      toast.error('يرجى ملء جميع الحقول');
      return;
    }

    const repeats = parseInt(repeat || 1);
    const newRides = [];

    for (let i = 0; i < repeats; i++) {
      const nextDate = dayjs(date).add(i, 'week').format('YYYY-MM-DD');
      newRides.push({ date: nextDate, time, bus_id, route_type });
    }

    const { error } = await supabase.from('rides').insert(newRides);
    if (error) {
      toast.error('فشل في الإضافة');
    } else {
      toast.success('تمت إضافة الرحلات');
      setShowForm(false);
      setEditingRide(null);
      setForm({ date: '', time: '', bus_id: '', route_type: 'go', repeat: 1 });
      fetchRides();
    }
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from('rides').delete().eq('id', id);
    if (error) toast.error('فشل الحذف');
    else {
      toast.success('تم الحذف');
      fetchRides();
    }
  };

  const filteredRides = rides.filter((ride) => {
    const matchesType = filterType === 'all' || ride.route_type === filterType;
    const matchesWeek = !filterWeekOnly || dayjs(ride.date).isSame(dayjs(), 'week');
    return matchesType && matchesWeek;
  });

  const groupedRides = filteredRides.reduce((acc, ride) => {
    const weekNumber = dayjs(ride.date).week();
    if (!acc[weekNumber]) acc[weekNumber] = [];
    acc[weekNumber].push(ride);
    return acc;
  }, {});

  const isPastRide = (ride) => {
    const rideDateTime = dayjs(`${ride.date}T${ride.time}`);
    return rideDateTime.isBefore(dayjs());
  };

  const startEdit = (ride) => {
    setForm({
      date: ride.date,
      time: ride.time,
      bus_id: ride.bus_id,
      route_type: ride.route_type,
      repeat: 1,
    });
    setEditingRide(ride);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-blue-600">إدارة الرحلات</h1>

      {/* الفلاتر */}
      <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded shadow">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="all">كل الأنواع</option>
          <option value="go">ذهاب</option>
          <option value="return">عودة</option>
        </select>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filterWeekOnly}
            onChange={(e) => setFilterWeekOnly(e.target.checked)}
            className="accent-orange-500"
          />
          هذا الأسبوع فقط
        </label>

        <button
          onClick={() => {
            setShowForm(true);
            setEditingRide(null);
            setForm({ date: '', time: '', bus_id: '', route_type: 'go', repeat: 1 });
          }}
          className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition flex items-center gap-2"
        >
          <PlusCircle size={18} />
          إضافة رحلة
        </button>
      </div>

      {/* عرض الرحلات مجمعة حسب الأسبوع */}
      {loading ? (
        <p>جاري التحميل...</p>
      ) : Object.keys(groupedRides).length === 0 ? (
        <p className="text-gray-500">لا توجد رحلات.</p>
      ) : (
        Object.entries(groupedRides).map(([week, ridesInWeek], i) => (
          <section
            key={week}
            className={`rounded-lg p-4 space-y-4 mb-6 ${i % 2 === 0 ? 'bg-orange-50' : 'bg-blue-50'}`}
          >
            <h2 className="text-md font-bold text-gray-700 border-b pb-1 mb-2">
              الأسبوع رقم {week}
            </h2>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {ridesInWeek.map((ride) => (
                <div
                  key={ride.id}
                  className="bg-white p-4 rounded shadow space-y-2 flex flex-col justify-between"
                >
                  <div>
                    <p className="text-sm text-gray-600">
                      📅 {dayjs(ride.date).format('dddd - YYYY-MM-DD')}
                    </p>
                    <p className="text-blue-700 font-bold">🚌 {ride.buses?.name}</p>
                    <p>🕒 {ride.time}</p>
                    <p className="text-orange-500">📌 {ride.route_type === 'go' ? 'ذهاب' : 'عودة'}</p>
                    {isPastRide(ride) && (
                      <p className="text-red-500 font-bold mt-1">🚫 رحلة منتهية</p>
                    )}
                  </div>
                  <div className="flex justify-between gap-2 mt-2">
                    <button
                      onClick={() => startEdit(ride)}
                      className="flex-1 bg-blue-600 text-white py-1 rounded hover:bg-blue-700 text-sm flex items-center justify-center gap-1"
                    >
                      <Pencil size={16} /> تعديل
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(ride.id)}
                      className="flex-1 bg-red-600 text-white py-1 rounded hover:bg-red-700 text-sm flex items-center justify-center gap-1"
                    >
                      <Trash2 size={16} /> حذف
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))
      )}

      {/* النموذج */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow w-full max-w-md relative">
            <button
              onClick={() => {
                setShowForm(false);
                setEditingRide(null);
              }}
              className="absolute top-3 left-3 text-gray-500 hover:text-red-500"
            >
              <X size={22} />
            </button>

            <h2 className="text-lg font-bold mb-4 text-blue-600">
              {editingRide ? 'تعديل الرحلة' : 'إضافة رحلة'}
            </h2>

            <div className="space-y-4">
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleFormChange}
                className="w-full border p-2 rounded"
              />
              <input
                type="time"
                name="time"
                value={form.time}
                onChange={handleFormChange}
                className="w-full border p-2 rounded"
              />
              <select
                name="bus_id"
                value={form.bus_id}
                onChange={handleFormChange}
                className="w-full border p-2 rounded"
              >
                <option value="">اختر الباص</option>
                {buses.map((bus) => (
                  <option key={bus.id} value={bus.id}>
                    {bus.name}
                  </option>
                ))}
              </select>
              <select
                name="route_type"
                value={form.route_type}
                onChange={handleFormChange}
                className="w-full border p-2 rounded"
              >
                {routeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              {!editingRide && (
                <div>
                  <label className="block mb-1">تكرار الرحلة (عدد الأسابيع):</label>
                  <select
                    name="repeat"
                    value={form.repeat}
                    onChange={handleFormChange}
                    className="w-full border p-2 rounded"
                  >
                    {[1, 2, 3, 4].map((n) => (
                      <option key={n} value={n}>
                        {n} أسبوع
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                onClick={handleSubmit}
                className="w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600"
              >
                {editingRide ? 'حفظ التعديلات' : 'إضافة الرحلات'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
          <div className="bg-white rounded shadow p-6 w-full max-w-sm text-center">
            <h2 className="text-lg font-bold text-red-600 mb-4">تأكيد الحذف</h2>
            <p className="text-gray-700 mb-6">هل أنت متأكد من حذف هذا الرحلة؟</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  handleDelete(confirmDeleteId);
                  setConfirmDeleteId(null);
                }}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                نعم، احذف
              </button>
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
