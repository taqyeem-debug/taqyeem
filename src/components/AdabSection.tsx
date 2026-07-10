import React, { useState, useEffect } from 'react';
import { getStudentAdabRecords, addAdabRecord, updateAdabRecord } from '../lib/db';
import { AdabRecord } from '../types';
import { format, startOfWeek, addDays, isSameDay, parseISO } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Save, Plus, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { isViewer } from '../lib/role';

interface Props {
  studentId: string;
}


const PREDEFINED_DEDUCTIONS = [
  { name: 'تأخر عن موعد الحصة', deduction: 1 },
  { name: 'لم يكن مستعدا', deduction: 1 },
  { name: 'لم يحضر الواجب', deduction: 1 },
  { name: 'تشاغل أثناء الدرس', deduction: 1 },
  { name: 'لم ينتبه أثناء التسميع', deduction: 1 },
  { name: 'قاطع الشيخ', deduction: 1 },
  { name: 'احتاج إلى تنبيه متكرر', deduction: 2 },
  { name: 'لم يلتزم بتعليمات الشيخ', deduction: 2 },
  { name: 'أسلوب غير مناسب في الكلام', deduction: 2 },
  { name: 'غياب بدون عذر', deduction: 10 },
];

export function AdabSection({ studentId }: Props) {
  const [records, setRecords] = useState<AdabRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  const [score, setScore] = useState<number>(10);
  const [notes, setNotes] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  const viewer = isViewer();

  // Arabic week starts on Saturday (which is index 6 in date-fns, but let's just generate the last 7 days or current week)
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 6 }); // 6 = Saturday
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      try {
        const res = await getStudentAdabRecords(studentId);
        setRecords(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, [studentId]);

  const currentRecord = records.find(r => isSameDay(parseISO(r.date), selectedDate));

  useEffect(() => {
    if (currentRecord) {
      setScore(currentRecord.score);
      setNotes(currentRecord.notes);
      setIsEditing(false);
    } else {
      setScore(10);
      setNotes('');
      setIsEditing(false);
    }
  }, [selectedDate, currentRecord]);

  const handleSave = async () => {
    if (viewer) return;
    
    try {
      if (currentRecord) {
        await updateAdabRecord(currentRecord.id, { score, notes });
        setRecords(records.map(r => r.id === currentRecord.id ? { ...r, score, notes } : r));
      } else {
        const newId = await addAdabRecord({
          student_id: studentId,
          date: selectedDate.toISOString(),
          score,
          notes
        });
        setRecords([...records, {
          id: newId,
          student_id: studentId,
          date: selectedDate.toISOString(),
          score,
          notes,
          created_at: new Date().toISOString()
        }]);
      }
      setIsEditing(false);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="h-24 flex items-center justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-900"></div></div>;

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-6 border border-gray-50 shadow-sm mb-8">
      <h3 className="text-lg font-bold text-gray-800 mb-4">الأدب والسلوك (أسبوعي)</h3>
      
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 hide-scrollbar">
        {weekDays.map((day, idx) => {
          const record = records.find(r => isSameDay(parseISO(r.date), day));
          const isSelected = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, new Date());
          
          return (
            <button
              key={idx}
              onClick={() => setSelectedDate(day)}
              className={cn(
                "flex flex-col items-center justify-center w-14 h-16 rounded-2xl shrink-0 transition-all border",
                isSelected 
                  ? "bg-primary-900 text-white border-primary-900 shadow-md" 
                  : "bg-gray-50 text-gray-500 hover:bg-gray-100 border-transparent",
                isToday && !isSelected && "border-primary-200 bg-primary-50 text-primary-700"
              )}
            >
              <span className="text-xs font-medium">{format(day, 'EEEE', { locale: ar }).substring(0, 3)}</span>
              <span className={cn("text-lg font-bold", isSelected ? "text-white" : "text-gray-900")}>
                {format(day, 'd')}
              </span>
              {record && (
                <div className={cn("w-1.5 h-1.5 rounded-full mt-1", 
                  record.score >= 8 ? "bg-emerald-400" : record.score >= 5 ? "bg-orange-400" : "bg-red-400"
                )}></div>
              )}
            </button>
          );
        })}
      </div>

      <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-bold text-gray-700">
            سجل يوم {format(selectedDate, 'EEEE d MMMM', { locale: ar })}
          </h4>
          {!viewer && !isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className="text-sm text-primary-900 font-bold bg-white px-3 py-1.5 rounded-lg shadow-sm border border-gray-200"
            >
              {currentRecord ? 'تعديل' : 'إضافة سجل'}
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-4">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">خصم سريع</label>
              <div className="flex flex-wrap gap-2">
                {PREDEFINED_DEDUCTIONS.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setScore(prev => Math.max(0, prev - item.deduction));
                      setNotes(prev => prev ? prev + ' - ' + item.name : item.name);
                    }}
                    className="text-sm bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg border border-red-100 transition-colors font-medium"
                  >
                    {item.name} (-{item.deduction})
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">التقييم (من 10)</label>
              <input 
                type="number" 
                min="0" max="10" 
                value={score} 
                onChange={e => setScore(Number(e.target.value))}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-900 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات</label>
              <textarea 
                value={notes} 
                onChange={e => setNotes(e.target.value)}
                placeholder="أضف ملاحظات حول السلوك..."
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-900 bg-white min-h-[80px]"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button 
                onClick={() => {
                  setIsEditing(false);
                  if (currentRecord) {
                    setScore(currentRecord.score);
                    setNotes(currentRecord.notes);
                  }
                }}
                className="px-4 py-2 text-gray-500 font-medium hover:bg-gray-200 rounded-xl transition-colors"
              >
                إلغاء
              </button>
              <button 
                onClick={handleSave}
                className="bg-primary-900 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-primary-800 transition-colors shadow-sm"
              >
                <Save size={16} />
                <span>حفظ</span>
              </button>
            </div>
          </div>
        ) : currentRecord ? (
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className={cn("text-2xl font-bold px-3 py-1 rounded-xl", 
                currentRecord.score >= 8 ? "bg-emerald-100 text-emerald-800" : 
                currentRecord.score >= 5 ? "bg-orange-100 text-orange-800" : 
                "bg-red-100 text-red-800"
              )}>
                {currentRecord.score} <span className="text-sm font-normal opacity-70">/ 10</span>
              </div>
            </div>
            {currentRecord.notes ? (
              <p className="text-gray-600 bg-white p-3 rounded-xl border border-gray-100 text-sm">
                {currentRecord.notes}
              </p>
            ) : (
              <p className="text-gray-400 text-sm italic">ما من ملاحظات</p>
            )}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-400">
            لم يتم تسجيل أدب لهذا اليوم.
          </div>
        )}
      </div>
    </div>
  );
}
