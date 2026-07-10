import { ErrorType } from '../types';

export const DEFAULT_ERROR_TYPES: ErrorType[] = [
  // أخطاء المراجعة والحفظ (من 30)
  { id: 'h1', name: 'نسيان كلمة', category: 'حفظ ومراجعة', default_deduction: 1, color: 'text-red-600 bg-red-50' },
  { id: 'h2', name: 'تبديل كلمة', category: 'حفظ ومراجعة', default_deduction: 1, color: 'text-orange-600 bg-orange-50' },
  { id: 'h3', name: 'زيادة كلمة', category: 'حفظ ومراجعة', default_deduction: 1, color: 'text-yellow-600 bg-yellow-50' },
  { id: 'h4', name: 'تقديم وتأخير', category: 'حفظ ومراجعة', default_deduction: 1, color: 'text-amber-600 bg-amber-50' },
  { id: 'h5', name: 'نسيان آية', category: 'حفظ ومراجعة', default_deduction: 3, color: 'text-rose-600 bg-rose-50' },
  { id: 'h6', name: 'تردد أو تلكؤ', category: 'حفظ ومراجعة', default_deduction: 0.5, color: 'text-slate-600 bg-slate-50' },
  { id: 'h7', name: 'فتح الشيخ', category: 'حفظ ومراجعة', default_deduction: 1, color: 'text-purple-600 bg-purple-50' },
  
  // أخطاء التجويد والأداء (من 10)
  { id: 't1', name: 'خطأ في المد', category: 'تجويد وأداء', default_deduction: 1, color: 'text-blue-600 bg-blue-50' },
  { id: 't2', name: 'ترك الغنة', category: 'تجويد وأداء', default_deduction: 0.5, color: 'text-cyan-600 bg-cyan-50' },
  { id: 't3', name: 'خطأ في المخرج', category: 'تجويد وأداء', default_deduction: 1, color: 'text-teal-600 bg-teal-50' },
  { id: 't4', name: 'خطأ في الصفة', category: 'تجويد وأداء', default_deduction: 1, color: 'text-emerald-600 bg-emerald-50' },
  { id: 't5', name: 'تفخيم خطأ', category: 'تجويد وأداء', default_deduction: 0.5, color: 'text-indigo-600 bg-indigo-50' },
  { id: 't6', name: 'ترقيق خطأ', category: 'تجويد وأداء', default_deduction: 0.5, color: 'text-violet-600 bg-violet-50' },
  { id: 't7', name: 'أحكام النون والتنوين', category: 'تجويد وأداء', default_deduction: 0.5, color: 'text-fuchsia-600 bg-fuchsia-50' },
  { id: 't8', name: 'أحكام الميم', category: 'تجويد وأداء', default_deduction: 0.5, color: 'text-pink-600 bg-pink-50' },
  { id: 't9', name: 'تشكيل', category: 'تجويد وأداء', default_deduction: 1, color: 'text-rose-700 bg-rose-100' },
  { id: 't10', name: 'تبديل حرف', category: 'تجويد وأداء', default_deduction: 1, color: 'text-orange-700 bg-orange-100' },
  
  // أخطاء الأدب (من 10)
  { id: 'a1', name: 'تأخر عن موعد الحصة', category: 'أدب وانضباط', default_deduction: 1, color: 'text-gray-600 bg-gray-100' },
  { id: 'a2', name: 'لم يكن مستعدا', category: 'أدب وانضباط', default_deduction: 1, color: 'text-gray-700 bg-gray-200' },
  { id: 'a3', name: 'لم يحضر الواجب', category: 'أدب وانضباط', default_deduction: 1, color: 'text-gray-800 bg-gray-300' },
  { id: 'a4', name: 'تشاغل أثناء الدرس', category: 'أدب وانضباط', default_deduction: 1, color: 'text-gray-600 bg-gray-100' },
  { id: 'a5', name: 'لم ينتبه أثناء التسميع', category: 'أدب وانضباط', default_deduction: 1, color: 'text-gray-600 bg-gray-100' },
  { id: 'a6', name: 'قاطع الشيخ', category: 'أدب وانضباط', default_deduction: 1, color: 'text-gray-600 bg-gray-100' },
  { id: 'a7', name: 'احتاج إلى تنبيه متكرر', category: 'أدب وانضباط', default_deduction: 2, color: 'text-gray-600 bg-gray-100' },
  { id: 'a8', name: 'لم يلتزم بتعليمات الشيخ', category: 'أدب وانضباط', default_deduction: 2, color: 'text-gray-600 bg-gray-100' },
  { id: 'a9', name: 'أسلوب غير مناسب في الكلام', category: 'أدب وانضباط', default_deduction: 2, color: 'text-gray-600 bg-gray-100' },
];
