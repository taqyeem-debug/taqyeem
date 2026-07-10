import { motion } from 'motion/react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { Users, FileText, UserPlus, BookOpen, Play, Activity, Settings, TrendingUp, Star, CalendarDays, ChevronLeft } from 'lucide-react';
import { getStudents, getStudentSessions } from '../lib/db';
import { Student, Session } from '../types';
import { isViewer } from '../lib/role';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [totalSessions, setTotalSessions] = useState(0);
  const [activeThisWeek, setActiveThisWeek] = useState(0);
  const [averageScore, setAverageScore] = useState(0);
  const [recentSessions, setRecentSessions] = useState<{student: Student, session: Session}[]>([]);
  
  const viewer = isViewer();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const studs = await getStudents();
        setStudents(studs);
        
        let sessionsCount = 0;
        let recent: {student: Student, session: Session}[] = [];
        let totalReviewScore = 0;
        let scoredSessionsCount = 0;
        
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        let activeStudents = new Set<string>();

        for (const s of studs) {
          const sessions = await getStudentSessions(s.id);
          sessionsCount += sessions.length;
          
          sessions.forEach(session => {
            const sessionDate = new Date(session.created_at);
            if (sessionDate >= oneWeekAgo) {
              activeStudents.add(s.id);
            }
            
            totalReviewScore += session.review_score;
            scoredSessionsCount++;
            
            recent.push({ student: s, session });
          });
        }
        
        setTotalSessions(sessionsCount);
        setActiveThisWeek(activeStudents.size);
        setAverageScore(scoredSessionsCount > 0 ? Number((totalReviewScore / scoredSessionsCount).toFixed(1)) : 0);
        
        recent.sort((a, b) => new Date(b.session.created_at).getTime() - new Date(a.session.created_at).getTime());
        setRecentSessions(recent.slice(0, 5));
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center max-w-2xl mx-auto px-4">
        <Logo className="w-48 h-auto mb-8" variant="vertical" />
        <h2 className="text-4xl font-bold mb-4 text-gray-900 tracking-tight">مرحباً بك في المقرأة</h2>
        <p className="text-gray-500 mb-10 text-lg leading-relaxed">
          نظام متكامل لتقييم حفظ القرآن الكريم، متابعة المراجعة والتجويد، وتسجيل أداء الطلاب بدقة وسهولة.
        </p>
        {!viewer && (
          <button
            onClick={() => navigate('/students/new')}
            className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all hover:scale-105 active:scale-95 text-lg shadow-xl shadow-primary-600/20"
          >
            <UserPlus size={24} />
            <span>إضافة الطالب الأول للبدء</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-2">لوحة التحكم</h1>
          <p className="text-gray-500">نظرة عامة على أداء الطلاب وإحصائيات المقرأة.</p>
        </div>
        
        {!viewer && (
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 w-full lg:w-auto">
            <button
              onClick={() => navigate('/students/new')}
              className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-6 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors shadow-sm flex-1 sm:flex-none"
            >
              <UserPlus size={20} />
              <span>إضافة طالب</span>
            </button>
            <button
              onClick={() => navigate('/students')}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors shadow-md shadow-primary-600/20 flex-1 sm:flex-none"
            >
              <Play size={20} fill="currentColor" />
              <span>بدء جلسة</span>
            </button>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary-50 rounded-full blur-2xl opacity-50 translate-x-1/2 -translate-y-1/2"></div>
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary-500"></span>
              <p className="text-gray-500 font-medium text-sm">إجمالي الطلاب</p>
            </div>
            <div className="bg-primary-50 text-primary-600 p-2 rounded-xl">
              <Users size={20} />
            </div>
          </div>
          <div className="relative z-10 flex items-end gap-3">
            <p className="text-3xl font-bold text-gray-900">{students.length}</p>
          </div>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full blur-2xl opacity-50 translate-x-1/2 -translate-y-1/2"></div>
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
              <p className="text-gray-500 font-medium text-sm">الجلسات المنعقدة</p>
            </div>
            <div className="bg-indigo-50 text-indigo-600 p-2 rounded-xl">
              <FileText size={20} />
            </div>
          </div>
          <div className="relative z-10 flex items-end gap-3">
            <p className="text-3xl font-bold text-gray-900">{totalSessions}</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full blur-2xl opacity-50 translate-x-1/2 -translate-y-1/2"></div>
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <p className="text-gray-500 font-medium text-sm">متوسط التقييم</p>
            </div>
            <div className="bg-emerald-50 text-emerald-600 p-2 rounded-xl">
              <Star size={20} />
            </div>
          </div>
          <div className="relative z-10 flex items-end gap-3">
            <p className="text-3xl font-bold text-gray-900">{averageScore}<span className="text-lg text-gray-400 font-medium ml-1">/ 30</span></p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-accent-50 rounded-full blur-2xl opacity-50 translate-x-1/2 -translate-y-1/2"></div>
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-accent-500"></span>
              <p className="text-gray-500 font-medium text-sm">نشط هذا الأسبوع</p>
            </div>
            <div className="bg-accent-50 text-accent-600 p-2 rounded-xl">
              <CalendarDays size={20} />
            </div>
          </div>
          <div className="relative z-10 flex items-end gap-3">
            <p className="text-3xl font-bold text-gray-900">{activeThisWeek}</p>
          </div>
        </motion.div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="text-lg font-bold text-gray-900">أحدث الجلسات</h3>
          <button 
            onClick={() => navigate('/students')}
            className="text-sm font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            عرض الكل
            <ChevronLeft size={16} />
          </button>
        </div>
        
        {recentSessions.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            ما من جلسات مسجلة بعد.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="bg-white text-gray-500 text-sm border-b border-gray-100">
                  <th className="font-medium p-5">الطالب</th>
                  <th className="font-medium p-5">التاريخ</th>
                  <th className="font-medium p-5">المراجعة</th>
                  <th className="font-medium p-5">التجويد</th>
                  <th className="font-medium p-5">السلوك</th>
                  <th className="font-medium p-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentSessions.map((item, idx) => (
                  <tr key={item.session.id} className="hover:bg-gray-50/50 transition-colors group cursor-pointer" onClick={() => navigate(`/students/${item.student.id}`)}>
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
                          {item.student.name.charAt(0)}
                        </div>
                        <span className="font-bold text-gray-900">{item.student.name}</span>
                      </div>
                    </td>
                    <td className="p-5 text-gray-600 font-medium text-sm">
                      {format(new Date(item.session.created_at), 'd MMMM yyyy', { locale: ar })}
                    </td>
                    <td className="p-5">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-bold bg-emerald-50 text-emerald-700">
                        {item.session.review_score} / 30
                      </span>
                    </td>
                    <td className="p-5">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-bold bg-primary-50 text-primary-700">
                        {item.session.tajweed_score} / 10
                      </span>
                    </td>
                    <td className="p-5">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-bold bg-purple-50 text-purple-700">
                        {item.session.adab_score} / 10
                      </span>
                    </td>
                    <td className="p-5 text-left">
                      <button className="text-gray-400 group-hover:text-primary-600 transition-colors p-2 rounded-lg hover:bg-primary-50">
                        <ChevronLeft size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
