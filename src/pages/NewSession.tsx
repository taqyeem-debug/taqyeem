import { Select } from '../components/Select';
import { createPortal } from 'react-dom';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStudent, addSession, addSessionError, getStudentSessions, getQuestionBank, updateStudent , getCustomErrorTypes, getSettings } from '../lib/db';
import { Student, Session, SessionError, QuestionBankItem, ErrorType, SessionType } from '../types';
import { DEFAULT_ERROR_TYPES } from '../lib/constants';
import { fetchSurahsMeta, fetchAyahRange, QuranMeta, Ayah } from '../lib/quran';
import { ArrowRight, Save, Play, X, Settings2, BookOpen, User, CheckCircle, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';


import { WordDisplay, WordInfo } from '../components/WordDisplay';

export default function NewSession() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<Student | null>(null);
  const [recentSessions, setRecentSessions] = useState<Session[]>([]);
  const [surahs, setSurahs] = useState<QuranMeta[]>([]);
  
  // Setup State
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionType, setSessionType] = useState<SessionType>('مراجعة قريبة');
  const [startSurah, setStartSurah] = useState<number>(1);
  const [startAyah, setStartAyah] = useState<number>(1);
  const [endSurah, setEndSurah] = useState<number>(1);
  const [endAyah, setEndAyah] = useState<number>(7);
  
  // Warning State for New Hifz
  const [newHifzWarning, setNewHifzWarning] = useState('');
  
  // Active Session State
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loadingAyahs, setLoadingAyahs] = useState(false);
  const [error, setError] = useState('');
  const [words, setWords] = useState<WordInfo[]>([]);
  const [examQuestions, setExamQuestions] = useState<QuestionBankItem[]>([]);
  const [showExamQuestions, setShowExamQuestions] = useState(false);
  const [customErrorTypes, setCustomErrorTypes] = useState<any[]>([]);
  const [errors, setErrors] = useState<Omit<SessionError, 'id' | 'session_id' | 'created_at'>[]>([]);

  const [adabNotes, setAdabNotes] = useState<{behavior_type: string, severity: string, deduction: number}[]>([]);
  
  const handleAddAdabNote = (errorType: any) => {
    setAdabNotes([...adabNotes, {
      behavior_type: errorType.name,
      severity: errorType.default_deduction >= 2 ? 'high' : errorType.default_deduction >= 1 ? 'medium' : 'low',
      deduction: errorType.default_deduction,
    }]);
  };

    
  // Error Selection State
  const [selectedItem, setSelectedItem] = useState<{ wordInfo: WordInfo, letterIndex?: number } | null>(null);
  const [errorScope, setErrorScope] = useState<'letter' | 'word' | 'ayah'>('letter');
  
  // Panel state
  
  useEffect(() => {
    getCustomErrorTypes().then(setCustomErrorTypes).catch(console.error);

    const init = async () => {
      if (!id) return;
      try {
        const [stud, sess, meta] = await Promise.all([
          getStudent(id),
          getStudentSessions(id),
          fetchSurahsMeta()
        ]);
        setStudent(stud);
        setRecentSessions(sess);
        setSurahs(meta);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id]);

  useEffect(() => {
    if (sessionType === 'حفظ جديد' && recentSessions.length > 0) {
      // Calculate averages from recent sessions
      let totalReview = 0;
      let totalTajweed = 0;
      let count = Math.min(5, recentSessions.length);
      for (let i = 0; i < count; i++) {
        totalReview += recentSessions[i].review_score;
        totalTajweed += recentSessions[i].tajweed_score;
      }
      const avgReview = totalReview / count;
      const avgTajweed = totalTajweed / count;
      
      if (avgReview < 25) {
        setNewHifzWarning('لا يُنصح بإعطاء الطالب حفظاً جديداً؛ لأن متوسط المراجعة أقل من الحد الأدنى (25).');
      } else if (avgTajweed < 5) {
        setNewHifzWarning('لا يُنصح بإعطاء الطالب حفظاً جديداً؛ لأن متوسط التجويد أقل من الحد الأدنى (5).');
      } else {
        setNewHifzWarning('');
      }
    } else {
      setNewHifzWarning('');
    }
  }, [sessionType, recentSessions]);

  const handleStartSession = async () => {
    if (startSurah > endSurah || (startSurah === endSurah && startAyah > endAyah)) {
      setError('نطاق القراءة غير صحيح.');
      return;
    }
    
    setLoadingAyahs(true);
    setSessionStarted(true);
    
    if (sessionType === 'اختبار شهري') {
      try {
        const bank = await getQuestionBank();
        // Get min and max surah
        const minSurah = Math.min(startSurah, endSurah);
        const maxSurah = Math.max(startSurah, endSurah);
        const filtered = bank.filter(q => q.surah_number >= minSurah && q.surah_number <= maxSurah);
        // optionally shuffle
        setExamQuestions(filtered.sort(() => Math.random() - 0.5).slice(0, 5)); // show up to 5 random questions
      } catch (err) {
        console.error('Failed to load exam questions', err);
      }
    }

    try {
      const fetchedAyahs = await fetchAyahRange(startSurah, startAyah, endSurah, endAyah);
      setAyahs(fetchedAyahs);
      
      // Process words
      let wordList: WordInfo[] = [];
      let currentSurah = 0;
      
      fetchedAyahs.forEach(ayah => {
        if (ayah.surahNumber !== currentSurah) {
          // Add Surah Header word if needed (handled in render usually, but we can add a marker)
          currentSurah = ayah.surahNumber;
        }
        
        const ayahWords = ayah.text.split(' ');
        ayahWords.forEach((w, i) => {
          if (w.trim()) {
            wordList.push({
              id: `${ayah.surahNumber}-${ayah.numberInSurah}-${i}`,
              text: w,
              surahNumber: ayah.surahNumber,
              ayahNumber: ayah.numberInSurah,
              wordIndex: i
            });
          }
        });
        
        // Add Ayah marker
        wordList.push({
          id: `${ayah.surahNumber}-${ayah.numberInSurah}-end`,
          text: `[${ayah.numberInSurah}]`,
          surahNumber: ayah.surahNumber,
          ayahNumber: ayah.numberInSurah,
          wordIndex: -1
        });
      });
      
      setWords(wordList);
    } catch (error) {
      console.error(error);
      setError('تعذر تحميل الآيات.');
      setSessionStarted(false);
    } finally {
      setLoadingAyahs(false);
    }
  };

  
  const errorsMap = useMemo(() => {
    const map = new Map<string, any[]>();
    errors.forEach(e => {
      const key = `${e.surah_number}-${e.ayah_number}-${e.word_index}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    });
    return map;
  }, [errors]);
  
  const ayahErrorsMap = useMemo(() => {
    const map = new Map<string, any[]>();
    errors.forEach(e => {
      if (e.selection_type === 'ayah') {
        const key = `${e.surah_number}-${e.ayah_number}`;
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(e);
      }
    });
    return map;
  }, [errors]);

  const handleWordClick = useCallback((w: WordInfo) => {
    setSelectedItem({ wordInfo: w, letterIndex: 0 });
    setErrorScope('word');
  }, []);

  

  const handleAyahClick = useCallback((w: WordInfo) => {
    setSelectedItem({ wordInfo: w });
    setErrorScope('ayah');
  }, []);

  const handleAddError = (errorType: ErrorType) => {
    if (!selectedItem || !student) return;
    
    const newErr: any = { 
      student_id: student.id,
      teacher_id: student.assigned_teacher_id || 'teacher1',
      category: errorType.category,
      error_type: errorType.name,
      surah_number: selectedItem.wordInfo.surahNumber,
      ayah_number: selectedItem.wordInfo.ayahNumber,
      word_index: errorScope === 'ayah' ? -1 : selectedItem.wordInfo.wordIndex,
      word_text: errorScope === 'ayah' ? 'الآية كاملة' : selectedItem.wordInfo.text,
      selection_type: errorScope,
      deduction: errorType.default_deduction,
      note: ''
    };
    
    if (errorScope === 'letter' && selectedItem.letterIndex !== undefined) {
      newErr.letter_index = selectedItem.letterIndex;
      newErr.letter_text = selectedItem.wordInfo.text[selectedItem.letterIndex];
    }
    
    setErrors([...errors, newErr]);
    
    setSelectedItem(null);
  };


  const removeError = (index: number) => {
    const newErrors = [...errors];
    newErrors.splice(index, 1);
    setErrors(newErrors);
  };

  const handleFinishSession = async () => {
    if (!student) return;
    
    let hifzDeduction = 0;
    let tajweedDeduction = 0;
    let adabDeduction = 0;
    
    errors.forEach(e => {
      if (e.category === 'حفظ ومراجعة') hifzDeduction += e.deduction;
      if (e.category === 'تجويد وأداء') tajweedDeduction += e.deduction;
    });
    
    
    const hScore = Math.max(0, 30 - hifzDeduction);
    const tScore = Math.max(0, 10 - tajweedDeduction);
    const aScore = Math.max(0, 10 - adabDeduction);
    const total = hScore + tScore + aScore;
    
    let newHifzAllowed = true;
    let decision = '';
    
    if (sessionType === 'حفظ جديد') {
      if (hifzDeduction > 1) {
        newHifzAllowed = false;
        decision = 'لا ينتقل إلى جديد (أخطاء الحفظ كثيرة)';
      } else if (tScore < 7) {
        newHifzAllowed = false;
        decision = 'لا ينتقل إلى جديد (التجويد أقل من 7)';
      } else {
        decision = 'ينتقل إلى حفظ جديد';
      }
    } else {
      if (hScore < 25) {
        newHifzAllowed = false;
        decision = 'ممنوع من الجديد (المراجعة ضعيفة)';
      } else if (tScore < 5) {
        newHifzAllowed = false;
        decision = 'ممنوع من الجديد (التجويد ضعيف)';
      }
    }

    try {
      const sessionId = await addSession({
        student_id: student.id,
        teacher_id: student.assigned_teacher_id || 'teacher1',
        session_type: sessionType,
        start_surah: startSurah,
        start_ayah: startAyah,
        end_surah: endSurah,
        end_ayah: endAyah,
        review_score: hScore,
        tajweed_score: tScore,
        adab_score: aScore,
        total_score: total,
        can_take_new_hifz: newHifzAllowed,
        new_hifz_decision: decision,
        notes: '',
        created_at: new Date().toISOString()
      });
      
      for (const err of errors) {
        const payload: any = {
          ...err,
          session_id: sessionId,
          created_at: new Date().toISOString()
        };
        if (payload.letter_index === undefined) delete payload.letter_index;
        if (payload.letter_text === undefined) delete payload.letter_text;
        
        await addSessionError(payload);
      }
      
      if (sessionType === 'اختبار شهري') {
        if (total < 45) {
          await updateStudent(student.id, { is_suspended_from_new: true });
        } else {
          await updateStudent(student.id, { is_suspended_from_new: false });
        }
      }
      
      // We would also save adabNotes to db if we fully implemented behavior_notes table insertion here.
      
      navigate(`/students/${student.id}`);
    } catch (e) {
      console.error(e);
      setError('حدث خطأ أثناء حفظ الجلسة');
    }
  };

  const getStartAyahsCount = () => {
    const s = surahs.find(s => s.number === startSurah);
    return s ? s.numberOfAyahs : 0;
  };
  
  const getEndAyahsCount = () => {
    const s = surahs.find(s => s.number === endSurah);
    return s ? s.numberOfAyahs : 0;
  };

  if (loading) {
    return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-900"></div></div>;
  }

  if (!sessionStarted) {
    return (
      <div className="max-w-3xl mx-auto pb-12">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white shadow-sm hover:bg-gray-50 transition-colors shrink-0">
            <ArrowRight size={20} className="text-gray-600" />
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary-900">إعداد جلسة التقييم</h1>
        </div>
        
        {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl font-bold">{error}</div>}
        <div className="bg-white p-5 sm:p-8 rounded-3xl shadow-sm border border-gray-50 space-y-8">
          <div className="flex items-center gap-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
            <div className="w-12 h-12 bg-primary-100 text-primary-900 rounded-xl flex items-center justify-center">
              <User size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">الطالب</p>
              <p className="font-bold text-lg text-primary-900">{student?.name}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2">نوع الجلسة</h2>
            <div className="flex flex-wrap gap-3">
              {['حفظ جديد', 'مراجعة قريبة', 'مراجعة بعيدة', 'اختبار شامل', 'اختبار شهري'].map((type) => (
                <button
                  key={type}
                  onClick={() => setSessionType(type as SessionType)}
                  className={cn(
                    "px-6 py-3 rounded-xl font-bold transition-all border-2",
                    sessionType === type 
                      ? "bg-primary-900 text-white border-primary-900" 
                      : "bg-white text-gray-600 border-gray-100 hover:border-primary-200"
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
            {newHifzWarning && (
              <div className="p-4 bg-orange-50 border border-orange-200 text-orange-800 rounded-xl flex items-start gap-3 mt-4">
                <AlertTriangle className="shrink-0 mt-0.5" size={20} />
                <p className="text-sm font-medium">{newHifzWarning}</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2">نطاق القراءة</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4 bg-gray-50/30 p-4 rounded-2xl border border-gray-100">
                <h3 className="font-bold text-primary-900 flex items-center gap-2"><Play size={16} /> من:</h3>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">السورة</label>
                  <Select 
                    value={startSurah} 
                    onChange={val => { setStartSurah(Number(val)); setStartAyah(1); }} 
                    options={surahs.map(s => ({ value: s.number, label: `${s.number}. ${s.name}` }))} 
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">الآية</label>
                  <Select 
                    value={startAyah} 
                    onChange={val => setStartAyah(Number(val))} 
                    options={Array.from({length: getStartAyahsCount()}, (_, i) => i + 1).map(n => ({ value: n, label: `آية ${n}` }))} 
                  />
                </div>
              </div>

              <div className="space-y-4 bg-gray-50/30 p-4 rounded-2xl border border-gray-100">
                <h3 className="font-bold text-primary-900 flex items-center gap-2"><CheckCircle size={16} /> إلى:</h3>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">السورة</label>
                  <Select 
                    value={endSurah} 
                    onChange={val => { setEndSurah(Number(val)); setEndAyah(1); }} 
                    options={surahs.filter(s => s.number >= startSurah).map(s => ({ value: s.number, label: `${s.number}. ${s.name}` }))} 
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">الآية</label>
                  <Select 
                    value={endAyah} 
                    onChange={val => setEndAyah(Number(val))} 
                    options={Array.from({length: getEndAyahsCount()}, (_, i) => i + 1).map(n => ({ value: n, label: `آية ${n}` }))} 
                  />
                </div>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleStartSession}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-sm text-lg"
          >
            <BookOpen size={24} />
            بدء التسميع
          </button>
        </div>
      </div>
    );
  }

  // Active Session View
  return (
    <>
    <div className="flex-1 flex flex-col min-h-[60vh] -mx-4 sm:mx-0 border-y sm:border sm:rounded-3xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-white px-4 sm:px-6 py-4 border-b flex flex-wrap justify-between items-center shrink-0 shadow-sm sm:rounded-t-3xl gap-4">
        <div className="flex items-center gap-4">
          <h2 className="font-bold text-xl text-primary-900">{student?.name}</h2>
          <span className="px-3 py-1 bg-primary-50 text-primary-900 rounded-full text-sm font-bold">{sessionType}</span>
        </div>
        {sessionType === 'اختبار شهري' && examQuestions.length > 0 && (
          <button onClick={() => setShowExamQuestions(true)} className="bg-accent-500 hover:bg-accent-600 text-white px-6 py-2.5 rounded-xl font-bold transition-colors mr-auto ml-4">
            أسئلة المتشابهات
          </button>
        )}
        <button onClick={handleFinishSession} className="bg-primary-900 hover:bg-primary-800 text-white px-6 py-2.5 rounded-xl font-bold transition-colors">
          إنهاء الجلسة
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col-reverse lg:flex-row overflow-y-auto lg:overflow-hidden">
        
        {/* Right Sidebar - Scores & Summary */}
        <div className="w-full lg:w-[320px] xl:w-[380px] shrink-0 bg-[#fcfcfc] border-t lg:border-t-0 lg:border-l border-gray-200 flex flex-col overflow-visible lg:overflow-y-auto h-auto lg:h-full relative z-20 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] lg:shadow-none">
          <div className="p-4 space-y-4">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-500 text-sm">الحفظ والمراجعة</span>
                    <span className="font-bold text-primary-900">
                      {Math.max(0, 30 - errors.filter(e => e.category === 'حفظ ومراجعة').reduce((sum, e) => sum + e.deduction, 0))} / 30
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${(Math.max(0, 30 - errors.filter(e => e.category === 'حفظ ومراجعة').reduce((sum, e) => sum + e.deduction, 0)) / 30) * 100}%` }}></div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-500 text-sm">التجويد والأداء</span>
                    <span className="font-bold text-primary-900">
                      {Math.max(0, 10 - errors.filter(e => e.category === 'تجويد وأداء').reduce((sum, e) => sum + e.deduction, 0))} / 10
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${(Math.max(0, 10 - errors.filter(e => e.category === 'تجويد وأداء').reduce((sum, e) => sum + e.deduction, 0)) / 10) * 100}%` }}></div>
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <h3 className="font-bold text-gray-700 text-sm mb-3">سجل الأخطاء</h3>
                  {errors.map((error, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex justify-between items-start group">
                      <div>
                        <p className="font-bold text-sm text-gray-800">{error.error_type}</p>
                        <p className="text-xs text-gray-500 mt-1 font-serif text-right" dir="rtl">
                          {error.selection_type === 'letter' ? `حرف: ${error.letter_text} في ` : ''} 
                          {error.selection_type === 'word' ? `كلمة: ` : ''} 
                          "{error.word_text}" (آية {error.ayah_number})
                        </p>
                      </div>
                      <button onClick={() => removeError(idx)} className="text-gray-300 hover:text-red-500 transition-colors">
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  {errors.length === 0 && <p className="text-sm text-gray-400 text-center py-4">لم يتم تسجيل أخطاء</p>}
                </div>

        </div>
  </div>
        {/* Center - Quran Area */}
        <div className="w-full lg:flex-1 bg-white relative flex flex-col h-auto lg:h-full min-h-[500px] lg:min-h-0 shrink-0 lg:shrink z-10">
          {loadingAyahs ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-900"></div>
            </div>
          ) : (
            <div className="flex-1 overflow-visible md:overflow-y-auto p-4 sm:p-6 md:p-8 lg:p-12 text-center relative" dir="rtl">
              


              <div className="font-serif text-3xl md:text-4xl leading-[2.5] md:leading-[2.8] text-primary-900 max-w-4xl mx-auto text-justify" style={{ textJustify: "inter-word" }}>
                {(() => {
                  let currentSurah = 0;
                  return words.map((word, i) => {
                    // Check if we need to render Surah separator
                    const isNewSurah = word.surahNumber !== currentSurah;
                    let surahHeader = null;
                    if (isNewSurah && word.wordIndex !== -1) {
                      currentSurah = word.surahNumber;
                      const surahInfo = surahs.find(s => s.number === currentSurah);
                      surahHeader = (
                        <div className="w-full flex justify-center my-10" key={`surah-${currentSurah}`}>
                          <div className="bg-primary-50/50 border border-primary-100 rounded-2xl py-4 px-12 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-2 h-full bg-primary-300"></div>
                            <h2 className="text-2xl font-bold text-primary-900 font-serif">سورة {surahInfo?.name}</h2>
                          </div>
                        </div>
                      );
                    }

                    if (word.wordIndex === -1) {
                      const ayahErrs = ayahErrorsMap.get(`${word.surahNumber}-${word.ayahNumber}`) || [];
                      const hasAyahError = ayahErrs.length > 0;
                      
                      return (
                        <React.Fragment key={`end-${word.surahNumber}-${word.ayahNumber}`}>
                          {surahHeader}
                          <span 
                            className={cn(
                              "inline-flex items-center justify-center w-10 h-10 mx-2 text-base font-sans relative align-middle cursor-pointer rounded-full transition-all duration-300",
                              hasAyahError ? "bg-red-100 text-red-600 shadow-[0_0_10px_rgba(239,68,68,0.3)] scale-110" : "text-accent-500 hover:bg-accent-500/10"
                            )}
                            onClick={() => handleAyahClick(word)}
                          >
                            {!hasAyahError && <span className="absolute inset-0 rounded-full border border-accent-500/30 bg-accent-500/5"></span>}
                            {hasAyahError && <span className="absolute inset-0 rounded-full border-2 border-red-400"></span>}
                            {word.ayahNumber}
                          </span>{' '}
                        </React.Fragment>
                      );
                    }

                    const wErrors = errorsMap.get(`${word.surahNumber}-${word.ayahNumber}-${word.wordIndex}`) || [];

                    return (
                      <React.Fragment key={word.id}>
                        {surahHeader}
                        <WordDisplay 
                          word={word} 
                          wordErrors={wErrors} 
                          onWordClick={handleWordClick} 
                        />{' '}
                      </React.Fragment>
                    );
                  });
                })()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* MODAL PORTED OUTSIDE */}
    {/* Exam Questions Modal */}
    {showExamQuestions && createPortal(
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => setShowExamQuestions(false)}
        />
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden z-10 w-full max-w-2xl max-h-[85vh] flex flex-col"
          dir="rtl"
        >
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-xl text-gray-900 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-accent-100 text-accent-600 flex items-center justify-center">
                <BookOpen size={18} />
              </span>
              أسئلة المتشابهات المقترحة
            </h3>
            <button 
              onClick={() => setShowExamQuestions(false)}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <div className="p-6 overflow-y-auto flex-1 space-y-4">
            {examQuestions.map((q, idx) => (
              <div key={q.id} className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-accent-200 transition-colors">
                <div className="flex gap-2 items-center mb-3">
                  <span className="bg-accent-50 text-accent-700 px-2.5 py-1 rounded-lg text-xs font-bold">
                    سؤال {idx + 1}
                  </span>
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-lg text-xs font-medium">
                    سورة {surahs.find(s => s.number === q.surah_number)?.name}
                  </span>
                </div>
                <p className="font-serif text-xl leading-loose text-primary-900 font-bold mb-2">
                  {q.type === 'متشابهات' && <span className="text-sm font-sans text-gray-500 block mb-1">الآية الأولى:</span>}
                  {q.question}
                </p>
                {q.answer && (
                  <div className="mt-3 p-3 bg-green-50 text-green-800 rounded-xl text-sm border border-green-100">
                    <span className="font-bold mr-1">{q.type === 'متشابهات' ? 'الآية المتشابهة:' : 'الإجابة:'}</span> {q.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    , document.body)}

              {/* Error Selection Modal */}
              {selectedItem && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/20 backdrop-blur-sm"
                    onClick={() => setSelectedItem(null)}
                  />
                  
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="bg-white p-6 rounded-3xl shadow-2xl border border-gray-100 max-w-2xl w-full relative z-10 max-h-[90vh] overflow-y-auto"
                  >
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-primary-900">تسجيل خطأ</h3>
                      <button onClick={() => setSelectedItem(null)} className="p-2 bg-gray-50 text-gray-500 rounded-full hover:bg-gray-100 transition-colors"><X size={20} /></button>
                    </div>
                    
                    <div className="flex bg-gray-50/80 p-1.5 rounded-2xl mb-6">
                      {selectedItem.wordInfo.wordIndex !== -1 && (
                        <button
                          onClick={() => setErrorScope('letter')}
                          className={cn("flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-200", errorScope === 'letter' ? "bg-white text-primary-900 shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100/50")}
                        >
                          حرف
                        </button>
                      )}
                      {selectedItem.wordInfo.wordIndex !== -1 && (
                        <button
                          onClick={() => setErrorScope('word')}
                          className={cn("flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-200", errorScope === 'word' ? "bg-white text-primary-900 shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100/50")}
                        >
                          كلمة
                        </button>
                      )}
                      <button
                        onClick={() => setErrorScope('ayah')}
                        className={cn("flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-200", errorScope === 'ayah' ? "bg-white text-primary-900 shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100/50")}
                      >
                        الآية ({selectedItem.wordInfo.ayahNumber})
                      </button>
                    </div>

                    <AnimatePresence mode="wait">
                      {errorScope === 'letter' && (
                        <motion.div 
                          key="letters"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex flex-wrap gap-2 mb-6 justify-center"
                          dir="rtl"
                        >
                          {selectedItem.wordInfo.text.split('').map((char, idx) => (
                            <button 
                              key={idx}
                              onClick={() => setSelectedItem({ ...selectedItem, letterIndex: idx })}
                              className={cn(
                                "w-12 h-12 flex items-center justify-center rounded-xl font-quran text-2xl border-2 transition-all duration-200", 
                                selectedItem.letterIndex === idx 
                                  ? "bg-primary-900 text-white border-primary-900 shadow-md scale-110" 
                                  : "bg-white text-gray-700 border-gray-100 hover:bg-gray-50 hover:border-gray-300 hover:scale-105"
                              )}
                            >
                              {char}
                            </button>
                          ))}
                        </motion.div>
                      )}
                      {errorScope === 'word' && (
                         <motion.div 
                           key="word"
                           initial={{ opacity: 0, height: 0 }}
                           animate={{ opacity: 1, height: 'auto' }}
                           exit={{ opacity: 0, height: 0 }}
                           className="flex justify-center mb-6"
                         >
                           <div className="font-quran text-4xl text-primary-900 bg-primary-50 px-6 py-4 rounded-2xl border border-primary-100 shadow-sm">
                             {selectedItem.wordInfo.text}
                           </div>
                         </motion.div>
                      )}
                    </AnimatePresence>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                      <div>
                        <h4 className="font-bold text-gray-700 mb-3 bg-gray-50 p-2 rounded-lg text-center">الحفظ والمراجعة</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {[...DEFAULT_ERROR_TYPES, ...customErrorTypes].filter(e => e.category === 'حفظ ومراجعة').map(err => (
                            <button
                              key={err.id}
                              onClick={() => handleAddError(err)}
                              className={cn("px-2 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all border border-transparent hover:border-current shadow-sm", err.color)}
                            >
                              {err.name}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-bold text-gray-700 mb-3 bg-gray-50 p-2 rounded-lg text-center">التجويد والأداء</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {[...DEFAULT_ERROR_TYPES, ...customErrorTypes].filter(e => e.category === 'تجويد وأداء').map(err => (
                            <button
                              key={err.id}
                              onClick={() => handleAddError(err)}
                              className={cn("px-2 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all border border-transparent hover:border-current shadow-sm", err.color)}
                            >
                              {err.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              , document.body)}
    </>
  );
}
