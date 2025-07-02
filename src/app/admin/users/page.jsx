'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { FileDown, Filter } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function AdminStudentsPage() {
    const [students, setStudents] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [universities, setUniversities] = useState([]);
    const [locations, setLocations] = useState([]);
    const [filters, setFilters] = useState({ university: '', location: '', gender: '' });

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        const { data: profiles } = await supabase
            .from('profiles')
            .select(`
        full_name, gender,phone,
        universities(name),
        locations(name)
      `)
            .eq('role', 'student');

        const { data: unis } = await supabase.from('universities').select('*');
        const { data: locs } = await supabase.from('locations').select('*');

        setStudents(profiles || []);
        setFiltered(profiles || []);
        setUniversities(unis || []);
        setLocations(locs || []);
    };

    const handleFilter = () => {
        const f = students.filter((s) => {
            return (
                (filters.university === '' || s.universities?.name === filters.university) &&
                (filters.location === '' || s.locations?.name === filters.location) &&
                (filters.gender === '' || s.gender === filters.gender)
            );
        });
        setFiltered(f);
    };

    const exportToExcel = () => {
        const data = filtered.map((s) => ({
            الاسم: s.full_name,
            'رقم الهاتف': s.phone || '',
            الجنس: s.gender === 'male' ? 'ذكر' : 'أنثى',
            الجامعة: s.universities?.name,
            المنطقة: s.locations?.name,
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'الطلاب');
        XLSX.writeFile(workbook, 'قائمة_الطلاب.xlsx');
    };

    return (
        <div className="p-4 text-right" dir="rtl">
            <h1 className="text-xl font-bold mb-6 text-blue-700">جميع الطلاب</h1>

            {/* الفلاتر */}
            <div className="grid sm:grid-cols-4 gap-4 mb-4">
                <select
                    value={filters.university}
                    onChange={(e) => setFilters({ ...filters, university: e.target.value })}
                    className="border rounded p-2"
                >
                    <option value="">كل الجامعات</option>
                    {universities.map((u) => (
                        <option key={u.id} value={u.name}>{u.name}</option>
                    ))}
                </select>

                <select
                    value={filters.location}
                    onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                    className="border rounded p-2"
                >
                    <option value="">كل المناطق</option>
                    {locations.map((l) => (
                        <option key={l.id} value={l.name}>{l.name}</option>
                    ))}
                </select>

                <select
                    value={filters.gender}
                    onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
                    className="border rounded p-2"
                >
                    <option value="">الكل</option>
                    <option value="male">ذكر</option>
                    <option value="female">أنثى</option>
                </select>

                <button
                    onClick={handleFilter}
                    className="bg-blue-600 text-white px-4 py-2 rounded flex items-center justify-center gap-1 hover:bg-blue-700"
                >
                    <Filter size={16} /> تطبيق الفلاتر
                </button>
            </div>

            {/* زر تصدير */}
            <div className="mb-2 flex justify-end">
                <button
                    onClick={exportToExcel}
                    className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-green-700"
                >
                    <FileDown size={18} /> تصدير إلى Excel
                </button>
            </div>

            {/* الجدول */}
            <div className="overflow-x-auto border rounded">
                <table className="min-w-full text-sm text-right">
                    <thead className="bg-blue-100 text-blue-800">
                        <tr>
                            <th className="p-2">الاسم</th>
                            <th className="p-2">رقم الهاتف</th>
                            <th className="p-2">الجنس</th>
                            <th className="p-2">الجامعة</th>
                            <th className="p-2">المنطقة</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((s, i) => (
                            <tr key={i} className="border-b hover:bg-gray-50">
                                <td className="p-2">{s.full_name}</td>
                                <td className="p-2">{s.phone || '-'}</td>
                                <td className="p-2">{s.gender === 'male' ? 'ذكر' : 'أنثى'}</td>
                                <td className="p-2">{s.universities?.name}</td>
                                <td className="p-2">{s.locations?.name}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
