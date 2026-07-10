import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addStudent } from '../lib/db';
import { ArrowRight, Save } from 'lucide-react';

export default function AddStudent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    current_level: '',
    current_hifz: '',
    current_review: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const id = await addStudent({
        name: formData.name,
        current_level: formData.current_level,
        current_hifz: formData.current_hifz,
        current_review: formData.current_review,
        notes: formData.notes,
        assigned_teacher_id: '', // Will be assigned by admin or context later
        status: 'active',
      });
      navigate(`/students/${id}`);
    } catch (error) {
      console.error('Error adding student:', error);
      setError('حدث خطأ أثناء إضافة الطالب');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white shadow-sm hover:bg-gray-50 transition-colors shrink-0"
        >
          <ArrowRight size={20} className="text-gray-600" />
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold text-primary-900">إضافة طالب جديد</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-50 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">اسم الطالب</label>
            <input
              required
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-900 focus:border-transparent bg-gray-50/50"
              placeholder="اكتب اسم الطالب رباعياً"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">المرحلة / المستوى</label>
            <input
              type="text"
              value={formData.current_level}
              onChange={(e) => setFormData({ ...formData, current_level: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-900 focus:border-transparent bg-gray-50/50"
              placeholder="مثال: متوسط، خاتم، تأسيس"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">مقدار الحفظ الحالي</label>
          <input
            type="text"
            value={formData.current_hifz}
            onChange={(e) => setFormData({ ...formData, current_hifz: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-900 focus:border-transparent bg-gray-50/50"
            placeholder="مثال: 5 أجزاء، سورة البقرة"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">مقدار المراجعة الحالي</label>
          <input
            type="text"
            value={formData.current_review}
            onChange={(e) => setFormData({ ...formData, current_review: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-900 focus:border-transparent bg-gray-50/50"
            placeholder="مثال: ربع يومياً"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">ملاحظات عامة</label>
          <textarea
            rows={4}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-900 focus:border-transparent bg-gray-50/50 resize-none"
            placeholder="نقاط القوة، الضعف، تنبيهات للشيخ..."
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-900 hover:bg-primary-800 disabled:bg-gray-400 text-white px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Save size={20} />
                <span>حفظ بيانات الطالب</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
