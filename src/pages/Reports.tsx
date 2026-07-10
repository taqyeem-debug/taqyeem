import { motion } from 'motion/react';
import React, { useEffect, useState } from 'react';
import { getStudents, getStudentSessions, getStudentAdabRecords } from '../lib/db';
import { Student, Session } from '../types';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { formatDate } from '../lib/utils';


interface ShortageReport {
  session: Session;
  student: Student;
  type: string[];
}

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<ShortageReport[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const students = await getStudents();
        const allReports: ShortageReport[] = [];
        
        for (const student of students) {
          const [sessions, adabRecords] = await Promise.all([getStudentSessions(student.id), getStudentAdabRecords(student.id)]);
          // Just taking all sessions for simplicity, could filter by last week
          for (const session of sessions) {
            const types = [];
            if (session.review_score < 25) types.push('نقص مراجعة');
            if (session.tajweed_score < 5) types.push('نقص تجويد');
                        
            if (types.length > 0) {
              allReports.push({
                session,
                student,
                type: types
              });
            }
          }
        }
        
        // Sort by date desc
        allReports.sort((a, b) => new Date(b.session.created_at).getTime() - new Date(a.session.created_at).getTime());
        setReports(allReports);
      } catch (error) {
        console.error('Error fetching reports:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-900"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-primary-900 mb-8">النواقص الأسبوعية</h1>
      
      {reports.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-50 shadow-sm">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">ممتاز!</h3>
          <p className="text-gray-500">ما من نواقص مسجلة هذا الأسبوع.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reports.map((report, idx) => (
            <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            key={`${report.session.id}-${idx}`} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-2 h-full bg-orange-400"></div>
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-primary-900 mb-1">{report.student.name}</h3>
                  <div className="flex items-center text-sm text-gray-500 gap-1">
                    <Clock size={14} />
                    <span>{formatDate(report.session.created_at)}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  {report.type.map((t, i) => (
                    <span key={i} className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-bold border border-orange-100">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-xl mt-4 grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-gray-500 mb-1">المراجعة</p>
                  <p className={`font-bold ${report.session.review_score < 25 ? 'text-orange-600' : 'text-primary-900'}`}>{report.session.review_score}/30</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">التجويد</p>
                  <p className={`font-bold ${report.session.tajweed_score < 5 ? 'text-orange-600' : 'text-primary-900'}`}>{report.session.tajweed_score}/10</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">الأدب</p>
                  <p className={`font-bold ${report.session.adab_score < 7 ? 'text-orange-600' : 'text-primary-900'}`}>{report.session.adab_score}/10</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
