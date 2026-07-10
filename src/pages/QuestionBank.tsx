import { Select } from '../components/Select';
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Search, BookOpen, AlertCircle } from 'lucide-react';
import { QuestionBankItem } from '../types';
import { getQuestionBank, addQuestion, deleteQuestion } from '../lib/db';
import { fetchSurahsMeta } from '../lib/quran';

export function QuestionBank() {
  const [questions, setQuestions] = useState<QuestionBankItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [surahs, setSurahs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [newQuestion, setNewQuestion] = useState({
    question: '',
    answer: '',
    surah_number: 1,
    type: 'متشابهات' as const
  });

  useEffect(() => {
    loadData();
    loadSurahs();
  }, []);

  const loadData = async () => {
    try {
      const q = await getQuestionBank();
      setQuestions(q);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadSurahs = async () => {
    const s = await fetchSurahsMeta();
    setSurahs(s);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.question) return;

    try {
      const id = await addQuestion(newQuestion);
      setQuestions([{ id, ...newQuestion, created_at: new Date().toISOString() }, ...questions]);
      setIsAdding(false);
      setNewQuestion({ question: '', answer: '', surah_number: 1, type: 'متشابهات' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متيقن من حذف هذا السؤال؟')) return;
    try {
      await deleteQuestion(id);
      setQuestions(questions.filter(q => q.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredQuestions = questions.filter(q => 
    q.question.includes(searchTerm) || 
    surahs.find(s => s.number === q.surah_number)?.name.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">مخزون المتشابهات</h1>
          <p className="text-gray-500 mt-1">إدارة أسئلة المتشابهات للاختبارات الشهرية</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="bg-primary-900 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-primary-800 transition-colors"
        >
          <Plus size={20} />
          <span>إضافة سؤال</span>
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {newQuestion.type === 'متشابهات' ? 'الآية الأولى' : 'السؤال'}
              </label>
              <textarea
                required
                value={newQuestion.question}
                onChange={e => setNewQuestion({...newQuestion, question: e.target.value})}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-900/20 focus:border-primary-900 min-h-[100px]"
                placeholder={newQuestion.type === 'متشابهات' ? 'اكتب الآية هنا...' : 'اكتب السؤال هنا (مثال: ما هي الآية التي تبدأ بـ...)'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {newQuestion.type === 'متشابهات' ? 'الآية المتشابهة معها' : 'الإجابة (اختياري)'}
              </label>
              <textarea
                required={newQuestion.type === 'متشابهات'}
                value={newQuestion.answer}
                onChange={e => setNewQuestion({...newQuestion, answer: e.target.value})}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-900/20 focus:border-primary-900 min-h-[100px]"
                placeholder={newQuestion.type === 'متشابهات' ? 'اكتب الآية المتشابهة هنا...' : 'اكتب الإجابة النموذجية...'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">السورة</label>
              <Select
                value={newQuestion.surah_number}
                onChange={value => setNewQuestion({...newQuestion, surah_number: Number(value)})}
                options={surahs.map(s => ({ value: s.number, label: s.name }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">النوع</label>
              <Select
                value={newQuestion.type}
                onChange={value => setNewQuestion({...newQuestion, type: value as any})}
                options={[
                  { value: 'متشابهات', label: 'متشابهات' },
                  { value: 'عام', label: 'عام' }
                ]}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="bg-primary-900 text-white px-6 py-2 rounded-xl hover:bg-primary-800 transition-colors"
            >
              حفظ السؤال
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="ابحث في الأسئلة أو السور..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-10 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-900/20 focus:border-primary-900"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-900"></div>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <p className="text-gray-500">ما من أسئلة مضافة بعد</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredQuestions.map((q) => (
              <div key={q.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-primary-50 text-primary-900 px-2 py-1 rounded-md text-xs font-bold">
                        سورة {surahs.find(s => s.number === q.surah_number)?.name}
                      </span>
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs font-medium">
                        {q.type}
                      </span>
                    </div>
                    <p className="font-bold text-gray-900 font-serif text-lg leading-loose">{q.question}</p>
                    {q.answer && (
                      <p className="text-gray-500 mt-2 text-sm">الإجابة: {q.answer}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(q.id)}
                    className="text-gray-300 hover:text-red-500 transition-colors shrink-0"
                    title="حذف"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
