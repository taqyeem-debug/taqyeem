import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Session } from '../types';
import { updateSession } from '../lib/db';
import { X, Save } from 'lucide-react';

interface Props {
  session: Session;
  onClose: () => void;
  onSave: (updated: Session) => void;
}

export function EditSessionModal({ session, onClose, onSave }: Props) {
  const [reviewScore, setReviewScore] = useState(session.review_score);
  const [tajweedScore, setTajweedScore] = useState(session.tajweed_score);
  const [notes, setNotes] = useState(session.notes || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = {
        review_score: reviewScore,
        tajweed_score: tajweedScore,
        notes: notes,
        total_score: reviewScore + tajweedScore
      };
      await updateSession(session.id, data);
      onSave({ ...session, ...data });
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-xl relative">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-primary-900">تعديل الجلسة</h2>
          <button onClick={onClose} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">درجة الحفظ والمراجعة (من 30)</label>
            <input 
              type="number" 
              min="0" max="30" 
              value={reviewScore} 
              onChange={e => setReviewScore(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-900 bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">درجة التجويد (من 10)</label>
            <input 
              type="number" 
              min="0" max="10" 
              value={tajweedScore} 
              onChange={e => setTajweedScore(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-900 bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">ملاحظات المعلم</label>
            <textarea 
              value={notes} 
              onChange={e => setNotes(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-900 bg-gray-50 min-h-[100px]"
            />
          </div>
          
          <div className="pt-4 flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors"
            >
              إلغاء
            </button>
            <button 
              onClick={handleSave}
              disabled={saving}
              className="flex-[2] py-3 bg-primary-900 hover:bg-primary-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
            >
              {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save size={20} />}
              <span>حفظ التعديلات</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  , document.body);
}
