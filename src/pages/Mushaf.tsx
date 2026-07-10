import { motion } from 'motion/react';
import React, { useState, useEffect } from 'react';
import { BookOpen, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface Surah {
  number: number;
  name: string;
  englishName: string;
  numberOfAyahs: number;
  revelationType: string;
}

export default function Mushaf() {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);
  const [surahText, setSurahText] = useState<{ ayahs: { numberInSurah: number, text: string }[] } | null>(null);
  const [loadingSurah, setLoadingSurah] = useState(false);

  useEffect(() => {
    const fetchSurahs = async () => {
      try {
        const response = await fetch('https://api.alquran.cloud/v1/meta');
        if (!response.ok) throw new Error('Failed to fetch data');
        const data = await response.json();
        setSurahs(data.data.surahs.references);
      } catch (err) {
        setError('تعذر تحميل فهرس السور. تأكد من اتصالك بالإنترنت.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSurahs();
  }, []);

  const handleSelectSurah = async (surahNumber: number) => {
    setSelectedSurah(surahNumber);
    setLoadingSurah(true);
    setSurahText(null);
    try {
      const response = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/quran-uthmani`);
      if (!response.ok) throw new Error('Failed to fetch surah');
      const data = await response.json();
      setSurahText(data.data);
    } catch (err) {
      setError('تعذر تحميل نص السورة.');
    } finally {
      setLoadingSurah(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-10 h-10 animate-spin text-primary-900" />
      </div>
    );
  }

  if (error && !selectedSurah) {
    return (
      <div className="text-center text-red-500 py-10 bg-red-50 rounded-2xl">
        <p>{error}</p>
      </div>
    );
  }

  if (selectedSurah) {
    const surahInfo = surahs.find(s => s.number === selectedSurah);
    return (
      <div className="max-w-4xl mx-auto pb-12">
        <div className="flex items-center gap-4 mb-8 sticky top-0 bg-[#faf9f6]/90 backdrop-blur-sm p-4 -mx-4 z-10">
          <button 
            onClick={() => setSelectedSurah(null)}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors"
          >
            <ArrowRight size={20} className="text-gray-600" />
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-primary-900 font-serif">{surahInfo?.name}</h1>
            <p className="text-sm text-gray-500 mt-1">آياتها {surahInfo?.numberOfAyahs} • {surahInfo?.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}</p>
          </div>
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>

        <div className="bg-white rounded-[2.5rem] p-10 md:p-16 shadow-lg border border-gray-100 relative overflow-hidden min-h-[60vh]">
          {/* Decorative corners */}
          <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-primary-100 rounded-tl-[2rem] opacity-50 m-6"></div>
          <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-primary-100 rounded-tr-[2rem] opacity-50 m-6"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-primary-100 rounded-bl-[2rem] opacity-50 m-6"></div>
          <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-primary-100 rounded-br-[2rem] opacity-50 m-6"></div>

          {loadingSurah ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-10 h-10 animate-spin text-primary-300" />
            </div>
          ) : surahText ? (
            <div className="text-center font-serif text-3xl md:text-4xl leading-[2.5] md:leading-[2.8] text-primary-900">
              {surahText.ayahs.map((ayah, i) => (
                <React.Fragment key={ayah.numberInSurah}>
                  <span className="mx-1">{ayah.text}</span>
                  <span className="inline-flex items-center justify-center w-10 h-10 mx-2 text-base font-sans text-accent-500 relative">
                    <span className="absolute inset-0 rounded-full border border-accent-500/30 bg-accent-500/5"></span>
                    {ayah.numberInSurah}
                  </span>
                </React.Fragment>
              ))}
            </div>
          ) : (
             <div className="text-center text-red-500">{error}</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-primary-50 text-primary-900 rounded-2xl flex items-center justify-center">
          <BookOpen size={24} />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary-900">فهرس سور القرآن الكريم</h1>
          <p className="text-gray-500 mt-1 text-sm">اختر السورة لعرض النص القرآني كاملاً</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {surahs.map((surah, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            key={surah.number} 
            onClick={() => handleSelectSurah(surah.number)}
            className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-primary-300 hover:shadow-md transition-all cursor-pointer flex justify-between items-center group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-2 h-full bg-primary-100 group-hover:bg-primary-500 transition-colors"></div>
            <div className="flex items-center gap-4 pr-3">
              <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-primary-900 font-bold group-hover:bg-primary-50 transition-colors">
                {surah.number}
              </div>
              <div>
                <p className="text-xl font-bold text-gray-800 font-serif mb-1 group-hover:text-primary-900 transition-colors">{surah.name}</p>
                <p className="text-xs text-gray-400 font-medium tracking-wide">
                  {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} • آياتها {surah.numberOfAyahs}
                </p>
              </div>
            </div>
            <div className="text-gray-300 group-hover:text-accent-500 transition-colors">
              <BookOpen size={20} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
