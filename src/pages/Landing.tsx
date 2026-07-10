import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Users, ShieldCheck } from 'lucide-react';
import { Logo } from '../components/Logo';
import { motion } from 'motion/react';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-center items-center p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-full h-96 bg-primary-900/5 -skew-y-6 transform origin-top-left -z-10"></div>
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-2xl mx-auto mb-16 text-center">
        <Logo className="w-48 h-auto mx-auto mb-8" variant="vertical" />
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-sm font-bold text-accent-600 mb-4 tracking-wider bg-accent-50 inline-block px-4 py-1.5 rounded-full">
          نظام ذكي للتقييم والمتابعة
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }} className="text-5xl md:text-7xl font-bold text-primary-900 mb-6 tracking-tight">
          منصّة التقييم
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.6 }} className="text-xl text-gray-500 mb-10 leading-relaxed">
          سجّل أخطاء التلاوة، قيّم الأداء، وتابع تطور طلابك بكل سهولة ويسر.
        </motion.p>
      </motion.div>

      <motion.div 
        initial="hidden"
        animate="visible"
        variants={{ 
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.3 }
          }
        }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        <motion.button
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/login?role=teacher')}
          className="bg-white hover:bg-gray-50 border-2 border-primary-100 p-8 rounded-[2rem] flex flex-col items-center text-center transition-all hover:border-primary-300 hover:shadow-md group"
        >
          <div className="w-16 h-16 bg-primary-50 text-primary-900 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <User size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">دخول الشيخ</h3>
          <p className="text-sm text-gray-500">لتقييم الطلاب ومتابعة الحلقات</p>
        </motion.button>

        <motion.button
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            localStorage.setItem('role', 'viewer');
            navigate('/dashboard');
          }}
          className="bg-white hover:bg-gray-50 border-2 border-primary-100 p-8 rounded-[2rem] flex flex-col items-center text-center transition-all hover:border-primary-300 hover:shadow-md group"
        >
          <div className="w-16 h-16 bg-accent-50 text-accent-700 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Users size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">دخول الزوار</h3>
          <p className="text-sm text-gray-500">متابعة التقييمات بدون كلمة مرور</p>
        </motion.button>

        <motion.button
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/login?role=admin')}
          className="bg-white hover:bg-gray-50 border-2 border-primary-100 p-8 rounded-[2rem] flex flex-col items-center text-center transition-all hover:border-primary-300 hover:shadow-md group"
        >
          <div className="w-16 h-16 bg-primary-50 text-primary-700 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <ShieldCheck size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">دخول المسؤول</h3>
          <p className="text-sm text-gray-500">لإدارة النظام وصلاحيات المعلمين</p>
        </motion.button>
      </motion.div>
    </div>
  );
}
