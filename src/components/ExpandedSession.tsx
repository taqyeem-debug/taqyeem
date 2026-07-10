import React, { useEffect, useState } from 'react';
import { Session, SessionError } from '../types';
import { getSessionErrors, deleteSession } from '../lib/db';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { formatDate } from '../lib/utils';
import { cn } from '../lib/utils';
import { isViewer } from '../lib/role';
import { EditSessionModal } from './EditSessionModal';
import { Edit } from 'lucide-react';

export function ExpandedSession({ session, onDelete }: { session: Session, onDelete?: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [errors, setErrors] = useState<SessionError[]>([]);
  const [loading, setLoading] = useState(false);
  const viewer = isViewer();
  const [isEditing, setIsEditing] = useState(false);
  const [currentSession, setCurrentSession] = useState(session);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (expanded && errors.length === 0) {
      setLoading(true);
      getSessionErrors(currentSession.id)
        .then(setErrors)
        .finally(() => setLoading(false));
    }
  }, [expanded, currentSession.id]);



  return (
    <div className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
      <div 
        className="p-6 flex items-center justify-between cursor-pointer group"
        onClick={() => setExpanded(!expanded)}
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="font-bold text-primary-900">
              {formatDate(currentSession.created_at)}
            </span>
            <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
              {currentSession.session_type}
            </span>
          </div>
          <p className="text-sm text-gray-600">
            سورة {currentSession.start_surah} آية {currentSession.start_ayah} ← سورة {currentSession.end_surah} آية {currentSession.end_ayah}
          </p>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-center hidden sm:block">
            <p className="text-xs text-gray-500 mb-1">الدرجة</p>
            <p className="font-bold text-xl text-primary-900">{currentSession.total_score} <span className="text-sm text-gray-400 font-normal">/ 50</span></p>
          </div>
          {!viewer && (
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
                className="text-gray-400 hover:text-primary-600 p-2 hover:bg-primary-50 rounded-full transition-colors"
                title="تعديل الجلسة"
              >
                <Edit size={18} />
              </button>
              {showDeleteConfirm ? (
                <div className="flex items-center gap-2 bg-red-50 p-1 rounded-lg border border-red-100" onClick={e => e.stopPropagation()}>
                  <span className="text-xs text-red-800 font-bold px-1">تأكيد؟</span>
                  <button onClick={async (e) => {
                    e.stopPropagation();
                    await deleteSession(currentSession.id);
                    if (onDelete) onDelete();
                  }} className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs font-bold transition-colors">نعم</button>
                  <button onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteConfirm(false);
                  }} className="bg-white text-gray-700 hover:bg-gray-100 px-2 py-1 rounded text-xs font-bold transition-colors shadow-sm">لا</button>
                </div>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteConfirm(true);
                  }}
                  className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-colors"
                  title="حذف الجلسة"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          )}
          {expanded ? (
            <ChevronUp className="text-primary-900" />
          ) : (
            <ChevronDown className="text-gray-400 group-hover:text-primary-900 transition-colors" />
          )}
        </div>
      </div>

      {expanded && (
        <div className="px-6 pb-6 pt-2 bg-gray-50/50">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm mb-4">
            <h4 className="font-bold text-sm text-gray-700 mb-3">تفاصيل الدرجات</h4>
            <div className="flex gap-4">
              <div className="flex-1 bg-gray-50 p-3 rounded-xl text-center">
                <p className="text-xs text-gray-500 mb-1">المراجعة</p>
                <p className="font-bold text-primary-900">{currentSession.review_score} / 30</p>
              </div>
              <div className="flex-1 bg-gray-50 p-3 rounded-xl text-center">
                <p className="text-xs text-gray-500 mb-1">التجويد</p>
                <p className="font-bold text-primary-900">{currentSession.tajweed_score} / 10</p>
              </div>
              <div className="flex-1 bg-gray-50 p-3 rounded-xl text-center">
                <p className="text-xs text-gray-500 mb-1">الأدب</p>
                <p className="font-bold text-primary-900">{currentSession.adab_score} / 10</p>
              </div>
            </div>
            {currentSession.notes && (
              <div className="mt-3 p-3 bg-blue-50/50 rounded-xl text-sm text-blue-900">
                <span className="font-bold">ملاحظات المعلم: </span>
                {currentSession.notes}
              </div>
            )}
          </div>

          <h4 className="font-bold text-sm text-gray-700 mb-3">الأخطاء المسجلة</h4>
          {loading ? (
            <div className="text-center text-sm text-gray-500 py-4">يجري التحميل...</div>
          ) : errors.length === 0 ? (
            <div className="text-center text-sm text-gray-500 py-4 bg-white rounded-2xl border border-gray-100">
              لم يتم تسجيل أي أخطاء في هذه الجلسة. ممتازة!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {errors.map((error, idx) => (
                <div key={idx} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center font-bold text-sm shrink-0">
                    -{error.deduction}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-800">{error.error_type}</p>
                    <p className="text-xs text-gray-500 mt-1 font-serif">
                      {error.selection_type === 'letter' ? `حرف: ${error.letter_text} في ` : ''} 
                      {error.selection_type === 'word' ? `كلمة: ` : ''} 
                      "{error.word_text}" (آية {error.ayah_number})
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    
      {isEditing && (
        <EditSessionModal 
          session={currentSession} 
          onClose={() => setIsEditing(false)} 
          onSave={(updated) => {
            setCurrentSession(updated);
            setIsEditing(false);
          }} 
        />
      )}
    </div>
  );
}
