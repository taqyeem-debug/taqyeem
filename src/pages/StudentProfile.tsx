import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, History, Award, Calendar, AlertTriangle, ArrowRight, Play, FileText, Trash2, Edit2, ChevronDown, Check, X, User, Clock, ShieldCheck, Activity } from 'lucide-react';
import { getStudent, getStudentSessions, deleteStudent, updateStudent } from '../lib/db';
import { Student, Session } from '../types';
import { format, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { ar } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { isViewer } from '../lib/role';
import { StudentCharts } from '../components/StudentCharts';
import { AdabSection } from '../components/AdabSection';
import { CommonErrors } from '../components/CommonErrors';

export default function StudentProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const viewer = isViewer();
    const role = localStorage.getItem('role');
    const permissionsStr = localStorage.getItem('user_permissions');
    const permissions = permissionsStr ? JSON.parse(permissionsStr) : null;
    const canDeleteStudents = role === 'admin' || (permissions && permissions.can_delete_students);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const studentData = await getStudent(id);
        const sessionsData = await getStudentSessions(id);
        
        setStudent(studentData || null);
        setSessions(sessionsData.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ));
      } catch (error) {
        console.error('Error fetching student details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const toggleSuspension = async () => {
    if (!student || viewer) return;
    try {
      await updateStudent(student.id, { is_suspended_from_new: !student.is_suspended_from_new });
      setStudent(prev => prev ? {...prev, is_suspended_from_new: !prev.is_suspended_from_new} : prev);
    } catch (e) {
      console.error(e);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'd MMMM yyyy', { locale: ar });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!student) {
    return <div className="text-center py-12 text-gray-500 text-lg">الطالب غير موجود</div>;
  }

  const currentHifzSessions = sessions.filter(s => s.session_type === 'حفظ جديد');
  const latestHifz = currentHifzSessions.length > 0 ? currentHifzSessions[0] : null;

  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 5 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 5 });
  
  const weeklyDeficiencies = sessions.filter(s => {
    const d = new Date(s.created_at);
    return isWithinInterval(d, { start: weekStart, end: weekEnd }) && (s.review_score < 25 || !s.can_take_new_hifz);
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Header Profile Section */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 relative overflow-hidden flex flex-col items-center text-center">
        <button 
          onClick={() => navigate('/students')}
          className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors z-20"
        >
          <ArrowRight size={20} className="text-gray-600" />
        </button>

        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full blur-3xl opacity-50 translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-50 -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="w-24 h-24 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-4xl font-bold mb-4 shadow-inner relative z-10 border-4 border-white">
          {student.name.charAt(0)}
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2 relative z-10">{student.name}</h1>
        <div className="flex flex-wrap items-center justify-center gap-2 relative z-10 mb-8">
          <span className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1.5">
            <BookOpen size={14} />
            {student.current_level || 'غير محدد'}
          </span>
          <button onClick={toggleSuspension} className={cn("px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer", student.is_suspended_from_new ? "bg-red-50 text-red-700 hover:bg-red-100" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100")}>
            <span className={cn("w-1.5 h-1.5 rounded-full", student.is_suspended_from_new ? "bg-red-500" : "bg-emerald-500")}></span>
            {student.is_suspended_from_new ? "موقوف عن الجديد" : "نشط"}
          </button>
        </div>

        <div className="flex gap-3 w-full sm:w-auto relative z-10">
          {!viewer && (
            <>
              <button
                onClick={() => navigate(`/students/${student.id}/edit`)}
                className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-6 py-2.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors flex-1 sm:flex-none shadow-sm"
              >
                <Edit2 size={18} />
                <span>تعديل</span>
              </button>
              <button
                onClick={() => navigate(`/students/${student.id}/session`)}
                className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-2.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors shadow-md shadow-primary-600/20 flex-1 sm:flex-none"
              >
                <Play size={18} fill="currentColor" />
                <span>بدء جلسة</span>
              </button>
              {showDeleteConfirm ? (
                <div className="flex items-center gap-2 bg-red-50 p-1.5 rounded-2xl border border-red-100 w-full sm:w-auto">
                  <span className="text-sm text-red-800 font-bold px-3 hidden sm:inline">تأكيد الحذف؟</span>
                  <button onClick={async () => {
                    await deleteStudent(student.id);
                    navigate('/students');
                  }} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors flex-1 sm:flex-none">نعم</button>
                  <button onClick={() => setShowDeleteConfirm(false)} className="bg-white text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-sm flex-1 sm:flex-none">لا</button>
                </div>
              ) : (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors flex-1 sm:flex-none"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary-500"></span>
              <h3 className="text-gray-500 font-medium text-sm">إجمالي الجلسات</h3>
            </div>
            <div className="w-10 h-10 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center">
              <FileText size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{sessions.length}</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <h3 className="text-gray-500 font-medium text-sm">المقدار الحالي للحفظ</h3>
            </div>
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <BookOpen size={20} />
            </div>
          </div>
          <p className="text-xl font-bold text-gray-900 leading-tight">{student.current_hifz || '—'}</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              <h3 className="text-gray-500 font-medium text-sm">المقدار الحالي للمراجعة</h3>
            </div>
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
              <History size={20} />
            </div>
          </div>
          <p className="text-xl font-bold text-gray-900 leading-tight">{student.current_review || '—'}</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent-500"></span>
              <h3 className="text-gray-500 font-medium text-sm">الاختبار القادم</h3>
            </div>
            <div className="w-10 h-10 bg-accent-50 text-accent-600 rounded-xl flex items-center justify-center">
              <Calendar size={20} />
            </div>
          </div>
          <p className="text-xl font-bold text-gray-900">
            {(() => {
              const now = new Date();
              let testDate = new Date(now.getFullYear(), now.getMonth(), 24);
              if (now.getDate() > 24) {
                testDate = new Date(now.getFullYear(), now.getMonth() + 1, 24);
              }
              const day = testDate.getDay();
              if (day === 5) testDate.setDate(23); // Friday -> Thursday
              else if (day === 6) testDate.setDate(22); // Saturday -> Thursday
              return format(testDate, 'd MMM yyyy', { locale: ar });
            })()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col h-full">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Clock size={20} className="text-primary-600" />
            تقدم الحفظ الجديد
          </h3>
          {latestHifz ? (
            <div className="bg-gray-50 p-5 rounded-2xl flex-1 flex flex-col justify-center border border-gray-100/80">
              <p className="text-sm text-gray-500 mb-3 font-medium">آخر ورد تم تسميعه</p>
              <p className="font-bold text-gray-900 mb-1 font-serif text-lg">من سورة {latestHifz.start_surah} آية {latestHifz.start_ayah}</p>
              <p className="font-bold text-gray-900 mb-3 font-serif text-lg">إلى سورة {latestHifz.end_surah} آية {latestHifz.end_ayah}</p>
              <div className="mt-auto flex items-center gap-2 text-xs text-primary-700 bg-primary-50 w-fit px-3 py-1.5 rounded-lg font-bold">
                <Calendar size={14} />
                {formatDate(latestHifz.created_at)}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 p-5 rounded-2xl flex-1 flex items-center justify-center text-gray-400 text-sm border border-gray-100/80 border-dashed">
              ما من سجل لحفظ جديد بعد.
            </div>
          )}
        </div>
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col h-full">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle size={20} className="text-accent-500" />
            النواقص الأسبوعية
          </h3>
          {weeklyDeficiencies.length > 0 ? (
            <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {weeklyDeficiencies.map(d => (
                <div key={d.id} className="bg-red-50 p-4 rounded-2xl border border-red-100/50 flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-bold text-red-900">{formatDate(d.created_at)}</p>
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  </div>
                  <p className="text-sm text-red-700">{d.new_hifz_decision || 'مراجعة ضعيفة'}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-emerald-50 p-5 rounded-2xl flex-1 flex flex-col items-center justify-center text-center gap-3 border border-emerald-100/50">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                <ShieldCheck size={24} />
              </div>
              <p className="text-emerald-700 font-bold">ما من نواقص هذا الأسبوع</p>
            </div>
          )}
        </div>
      </div>

      {student.notes && (
        <div className="bg-accent-50 rounded-3xl p-6 border border-accent-100 shadow-sm">
          <h3 className="font-bold text-accent-900 mb-3 flex items-center gap-2">
            <AlertTriangle size={18} />
            ملاحظات عامة
          </h3>
          <p className="text-accent-800 text-sm leading-relaxed whitespace-pre-wrap">{student.notes}</p>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <AdabSection studentId={student.id} />
        <CommonErrors studentId={student.id} />
      </div>
      
      <StudentCharts sessions={sessions} />
      
      {/* Sessions List */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mt-8">
        <div className="p-6 md:p-8 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center">
              <History size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">سجل الجلسات</h2>
          </div>
        </div>
        
        {sessions.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText size={24} />
            </div>
            <p className="text-gray-500 font-medium text-lg">ما من جلسات تقييم لهذا الطالب</p>
            <p className="text-gray-400 text-sm mt-2">ابدأ أول جلسة تقييم لتسجيل البيانات</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {sessions.map((session, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(idx * 0.05, 0.5) }}
                key={session.id}
              >
                <ExpandedSession 
                  session={session} 
                  onDelete={() => setSessions(sessions.filter(s => s.id !== session.id))}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ExpandedSession({ session, onDelete }: { session: Session, onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const viewer = isViewer();

  const getScoreColor = (score: number, max: number) => {
    const percentage = score / max;
    if (percentage >= 0.9) return 'text-emerald-600 bg-emerald-50';
    if (percentage >= 0.7) return 'text-accent-600 bg-accent-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="flex flex-col transition-colors hover:bg-gray-50/50">
      <div 
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 cursor-pointer gap-4"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-transform", expanded ? "bg-primary-100 text-primary-600 rotate-180" : "bg-gray-100 text-gray-500")}>
            <ChevronDown size={20} />
          </div>
          <div>
            <p className="font-bold text-gray-900">{format(new Date(session.created_at), 'EEEE, d MMMM yyyy', { locale: ar })}</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <div className={cn("px-3 py-1.5 rounded-lg flex flex-col items-center min-w-[70px]", getScoreColor(session.review_score, 30))}>
            <span className="text-xs font-medium opacity-80 mb-0.5">المراجعة</span>
            <span className="font-bold">{session.review_score}</span>
          </div>
          <div className={cn("px-3 py-1.5 rounded-lg flex flex-col items-center min-w-[70px]", getScoreColor(session.tajweed_score, 10))}>
            <span className="text-xs font-medium opacity-80 mb-0.5">التجويد</span>
            <span className="font-bold">{session.tajweed_score}</span>
          </div>
          <div className={cn("px-3 py-1.5 rounded-lg flex flex-col items-center min-w-[70px]", getScoreColor(session.adab_score, 10))}>
            <span className="text-xs font-medium opacity-80 mb-0.5">السلوك</span>
            <span className="font-bold">{session.adab_score}</span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-6 pt-0 border-t border-gray-100/50 bg-gray-50/30 m-4 mt-0 rounded-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                <div>
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <BookOpen size={18} className="text-emerald-600" />
                    المقدار المسمع
                  </h4>
                  <div className="bg-white p-4 rounded-xl border border-gray-100">
                    <div className="space-y-3">
                      <div>
                        <span className="text-gray-500 text-sm block mb-1">من:</span>
                        <p className="font-serif text-lg font-bold">سورة {session.start_surah} - آية {session.start_ayah}</p>
                      </div>
                      <div className="h-px bg-gray-100 w-full"></div>
                      <div>
                        <span className="text-gray-500 text-sm block mb-1">إلى:</span>
                        <p className="font-serif text-lg font-bold">سورة {session.end_surah} - آية {session.end_ayah}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <AlertTriangle size={18} className="text-red-500" />
                      الأخطاء والتنبيهات
                    </h4>
                    <div className="bg-white p-4 rounded-xl border border-gray-100 space-y-3">
                      <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                        <span className="text-gray-600">أخطاء الحفظ:</span>
                        <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md">{session.hifz_mistakes}</span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                        <span className="text-gray-600">التردد أو التلكؤ:</span>
                        <span className="font-bold text-accent-600 bg-accent-50 px-2 py-0.5 rounded-md">{session.hesitation_mistakes}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">أخطاء التجويد:</span>
                        <span className="font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md">{session.tajweed_mistakes}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {session.notes && (
                <div className="mt-6">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <FileText size={18} className="text-gray-400" />
                    ملاحظات المعلم
                  </h4>
                  <div className="bg-white p-4 rounded-xl border border-gray-100">
                    <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">{session.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
