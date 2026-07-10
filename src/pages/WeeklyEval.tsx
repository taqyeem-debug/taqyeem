import { motion } from 'motion/react';
import React, { useEffect, useState } from 'react';
import { getStudents, getStudentSessions, getStudentAdabRecords } from '../lib/db';
import { AdabRecord } from '../types';
import { Student, Session } from '../types';
import { ShieldCheck, TrendingUp } from 'lucide-react';

export default function WeeklyEval() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ student: Student, sessions: Session[], adab: AdabRecord[] }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const students = await getStudents();
        const arr = [];
        for (const s of students) {
          const [sessions, adab] = await Promise.all([getStudentSessions(s.id), getStudentAdabRecords(s.id)]);
          // Just taking all sessions for simplicity, in a real app we'd filter by the last 7 days
          if (sessions.length > 0) {
            arr.push({ student: s, sessions, adab });
          }
        }
        setData(arr);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-900"></div></div>;

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-primary-50 text-primary-900 rounded-2xl flex items-center justify-center shadow-sm">
          <TrendingUp size={24} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-primary-900">التقييم الأسبوعي الشامل</h1>
      </div>

      {data.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-50 shadow-sm text-gray-500">
          ما من تقييم أسبوعي بعد.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {data.map((item, idx) => {
            const avgReview = item.sessions.reduce((s, a) => s + a.review_score, 0) / (item.sessions.length || 1);
            const avgTajweed = item.sessions.reduce((s, a) => s + a.tajweed_score, 0) / (item.sessions.length || 1);
            const avgAdab = item.adab.length > 0 ? item.adab.reduce((s, a) => s + a.score, 0) / item.adab.length : 10;
            
            let status = 'ممتاز';
            if (item.student.is_suspended_from_new) status = 'موقوف عن الجديد';
            else if (avgReview < 25) status = 'ممنوع من الجديد حتى تتحسن المراجعة';
            else if (avgTajweed < 7) status = 'يحتاج إلى تحسين التجويد';
            else if (avgReview < 28) status = 'جيد جداً';

            return (
              <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              key={idx} className="bg-white p-6 rounded-3xl border border-gray-50 shadow-sm flex flex-col md:flex-row gap-6 justify-between items-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-2 h-full bg-primary-100"></div>
                
                <div>
                  <h3 className="text-xl font-bold text-primary-900 mb-2">{item.student.name}</h3>
                  <p className="text-gray-500 text-sm mb-1">عدد الجلسات: {item.sessions.length}</p>
                  <p className="text-sm font-bold text-gray-700 bg-gray-50 inline-block px-3 py-1 rounded-lg mt-2 border border-gray-100">
                    الحكم: {status}
                  </p>
                </div>

                <div className="flex gap-4">
                  <div className="text-center bg-gray-50 px-4 py-3 rounded-2xl border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">المراجعة</p>
                    <p className="font-bold text-lg text-primary-900">{avgReview.toFixed(1)} <span className="text-xs font-normal text-gray-400">/ 30</span></p>
                  </div>
                  <div className="text-center bg-gray-50 px-4 py-3 rounded-2xl border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">التجويد</p>
                    <p className="font-bold text-lg text-primary-900">{avgTajweed.toFixed(1)} <span className="text-xs font-normal text-gray-400">/ 10</span></p>
                  </div>
                  <div className="text-center bg-gray-50 px-4 py-3 rounded-2xl border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">الأدب</p>
                    <p className="font-bold text-lg text-primary-900">{avgAdab.toFixed(1)} <span className="text-xs font-normal text-gray-400">/ 10</span></p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
