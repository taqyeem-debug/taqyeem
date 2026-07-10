import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { UserPlus, Search, ChevronLeft, BookOpen, User, Users } from 'lucide-react';
import { getStudents } from '../lib/db';
import { Student } from '../types';
import { isViewer } from '../lib/role';

export default function StudentsList() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const viewer = isViewer();
    const role = localStorage.getItem('role');
    const permissionsStr = localStorage.getItem('user_permissions');
    const permissions = permissionsStr ? JSON.parse(permissionsStr) : null;
    const canAddStudents = role === 'admin' || (permissions && permissions.can_add_students);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const studs = await getStudents();
        setStudents(studs);
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredStudents = students.filter(s => s.name.includes(search));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 tracking-tight">الطلاب</h1>
          <p className="text-gray-500">إدارة ومتابعة طلاب المقرأة</p>
        </div>
        
        <div className="flex flex-col sm:flex-row flex-wrap w-full lg:w-auto gap-4">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="ابحث عن اسم الطالب..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-4 pr-12 py-3.5 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-900 bg-white shadow-sm"
            />
          </div>
          {!viewer && canAddStudents && (
          <button onClick={() => navigate('/students/new')} className="bg-primary-900 hover:bg-primary-800 text-white px-6 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors shadow-md shadow-primary-900/20 shrink-0"
            >
              <UserPlus size={20} />
              <span>إضافة طالب</span>
            </button>
          )}
        </div>
      </div>

      {students.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] p-16 text-center border border-gray-100 shadow-sm flex flex-col items-center">
          <div className="w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center mb-6 relative overflow-hidden">
             <div className="absolute inset-0 bg-primary-100 opacity-50 blur-xl"></div>
            <Users size={40} className="text-primary-900 relative z-10" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">ما من طلاب بعد</h3>
          <p className="text-gray-500 mb-8 max-w-md text-lg leading-relaxed">لم تُضف أي طالب إلى المقرأة حتى الآن. أضف الطالب الأول لتشرع في جلسات التقييم.</p>
          {!viewer && canAddStudents && (
            <button
              onClick={() => navigate('/students/new')}
              className="bg-primary-50 text-primary-700 hover:bg-primary-100 px-8 py-4 rounded-2xl font-bold transition-colors text-lg"
            >
              إضافة الطالب الأول
            </button>
          )}
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm flex flex-col items-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
             <Search size={32} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">ما من نتائج مطابقة</h3>
          <p className="text-gray-500">حاول البحث باستخدام اسم آخر.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(idx * 0.05, 0.5) }}
              key={student.id}
              onClick={() => navigate(`/students/${student.id}`)}
              className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-primary-200 transition-all cursor-pointer group relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-primary-600 to-primary-900 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-50 text-primary-700 rounded-2xl flex items-center justify-center font-bold text-lg border border-primary-100">
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-primary-900 transition-colors">{student.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded-md w-fit">
                      <BookOpen size={12} />
                      {student.current_level || 'غير محدد'}
                    </div>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-primary-50 group-hover:text-primary-900 transition-colors">
                  <ChevronLeft size={18} />
                </div>
              </div>
              
              <div className="space-y-3 relative z-10">
                <div className="flex justify-between items-center text-sm p-3 bg-gray-50/50 rounded-xl border border-gray-100/50">
                  <span className="text-gray-500">موضع الحفظ</span>
                  <span className="font-bold text-gray-900">{student.current_hifz || '—'}</span>
                </div>
                <div className="flex justify-between items-center text-sm p-3 bg-gray-50/50 rounded-xl border border-gray-100/50">
                  <span className="text-gray-500">موضع المراجعة</span>
                  <span className="font-bold text-gray-900">{student.current_review || '—'}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
