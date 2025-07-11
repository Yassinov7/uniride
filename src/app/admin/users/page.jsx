'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { FileDown, Filter } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useLoadingStore } from '@/store/loadingStore';

export default function AdminStudentsPage() {
    const [students, setStudents] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [universities, setUniversities] = useState([]);
    const [locations, setLocations] = useState([]);
    const [filters, setFilters] = useState({ university: '', location: '', gender: '' });
    const [searchQuery, setSearchQuery] = useState('');
    const { setLoading } = useLoadingStore();

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const { data: profiles } = await supabase
                .from('profiles')
                .select(`
                full_name, gender, phone,
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
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
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
        <div className="min-w-0 text-right space-y-6 mb-60" >
            <h1 className="text-xl font-bold mb-6 text-blue-700">جميع الطلاب</h1>

            {/* حقل البحث */}
            <div className="mb-4 flex justify-start">
                <input
                    type="text"
                    placeholder="ابحث باسم الطالب..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border px-4 py-2 min-w-0 rounded w-full sm:w-64"
                />
            </div>
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
                    <option value="female">طالبات</option>
                    <option value="male">طلاب</option>
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
                <table className="min-w-full text-sm text-center">
                    <thead className="bg-blue-100 text-blue-800">
                        <tr>
                            <th className="p-1">الاسم</th>
                            <th className="p-1">رقم الهاتف</th>
                            <th className="p-1">الجنس</th>
                            <th className="p-1">الجامعة</th>
                            <th className="p-1">المنطقة</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered
                            .filter((s) =>
                                s.full_name?.toLowerCase().includes(searchQuery.trim().toLowerCase())
                            )
                            .map((s, i) => (
                                <tr key={i} className="border-b hover:bg-orange-200">
                                    <td className="p-1">{s.full_name}</td>
                                    <td className="p-1">
                                        {s.phone ? (
                                            <a href={`tel:${s.phone}`} className="text-orange-600 hover:text-orange-800">
                                                {s.phone}
                                            </a>
                                        ) : (
                                            '-'
                                        )}
                                    </td>
                                    <td className="p-1">{s.gender === 'male' ? 'طالب' : 'طالبة'}</td>
                                    <td className="p-1">{s.universities?.name}</td>
                                    <td className="p-1">{s.locations?.name}</td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
