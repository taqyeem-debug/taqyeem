import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { login } from '../lib/auth';
import { getUser } from '../lib/db';
import { ArrowRight, Lock, Mail } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role') || 'teacher';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const cred = await login(email, password);
      if (cred && cred.user) {
        const userDoc = await getUser(cred.user.uid);
        if (userDoc) {
          localStorage.setItem('role', userDoc.role);
          localStorage.setItem('user_id', userDoc.id);
          localStorage.setItem('user_name', userDoc.name);
          if (userDoc.permissions) {
             localStorage.setItem('user_permissions', JSON.stringify(userDoc.permissions));
          }
        } else {
          // If no doc, assume teacher by default or keep existing fallback
          localStorage.setItem('role', role); 
        }
      }
      navigate('/dashboard');
    } catch (err: any) {

      setError('بيانات الدخول غير صحيحة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#faf9f6]">
      <div className="w-full max-w-md">
        <button 
          onClick={() => navigate('/')}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white shadow-sm hover:bg-gray-50 transition-colors mb-8"
        >
          <ArrowRight size={20} className="text-gray-600" />
        </button>

        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
          <h2 className="text-3xl font-bold text-primary-900 mb-2">تسجيل الدخول</h2>
          <p className="text-gray-500 mb-8">
            {role === 'admin' ? 'صلاحيات المسؤول (الإدارة)' : 'صلاحيات الشيخ (التقييم)'}
          </p>

          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-2xl mb-6 text-sm font-medium border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-4 pr-12 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-900 bg-gray-50/50"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-4 pr-12 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-900 bg-gray-50/50"
                  dir="ltr"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-900 hover:bg-primary-800 text-white px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-70 text-lg mt-4"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'دخول'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
