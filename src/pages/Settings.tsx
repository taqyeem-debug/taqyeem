import { Select } from '../components/Select';
import React, { useState, useEffect } from 'react';
import { Save, Sliders, BookOpen, Layout, Type, Palette, User, Lock, Plus, Trash2, Users, Shield } from 'lucide-react';
import { updatePassword, createSecondaryUser } from '../lib/auth';
import { updateSettings, getSettings, getCustomErrorTypes, addCustomErrorType, deleteCustomErrorType, getUsers, addUser, updateUser, getUser } from '../lib/db';
import { DEFAULT_ERROR_TYPES } from '../lib/constants';
import { ErrorType, User as UserType } from '../types';
import { isViewer, getUserRole } from '../lib/role';

export default function Settings() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  
  const [myProfile, setMyProfile] = useState<UserType | null>(null);
  const [profileName, setProfileName] = useState('');

  const [hifzScore, setHifzScore] = useState('30');
  const [tajweedScore, setTajweedScore] = useState('10');
  const [adabScore, setAdabScore] = useState('10');
  const [quranFont, setQuranFont] = useState('uthmani');
  const [quranFontSize, setQuranFontSize] = useState('4xl');
  const [riwaya, setRiwaya] = useState('hafs');
  const [theme, setTheme] = useState('light');
  const [defaultSessionType, setDefaultSessionType] = useState('حفظ جديد');
  
  const [customErrors, setCustomErrors] = useState<ErrorType[]>([]);
  const [newErrorName, setNewErrorName] = useState('');
  const [newErrorCategory, setNewErrorCategory] = useState<'حفظ ومراجعة' | 'تجويد وأداء' | 'أدب وانضباط'>('حفظ ومراجعة');
  const [newErrorDeduction, setNewErrorDeduction] = useState('1');

  const [errorDeductions, setErrorDeductions] = useState<Record<string, string>>({});
  
  const [users, setUsers] = useState<UserType[]>([]);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserPermissions, setNewUserPermissions] = useState({
    can_add_students: false,
    can_delete_students: false,
    can_edit_settings: false
  });
  const [creatingUser, setCreatingUser] = useState(false);

  const viewer = isViewer();
  const role = getUserRole();
  const currentUserId = localStorage.getItem('user_id');

  useEffect(() => {
    Promise.all([getSettings(), getCustomErrorTypes(), getUsers()]).then(([s, custom, allUsers]) => {
      setCustomErrors(custom);
      setUsers(allUsers);
      
      if (currentUserId) {
        const me = allUsers.find(u => u.id === currentUserId);
        if (me) {
          setMyProfile(me);
          setProfileName(me.name);
        }
      }
      
      let baseDeductions = DEFAULT_ERROR_TYPES.reduce((acc, err) => ({...acc, [err.id]: err.default_deduction.toString()}), {} as Record<string, string>);
      custom.forEach(err => {
        baseDeductions[err.id] = err.default_deduction.toString();
      });

      if (s) {
        if (s.hifzScore) setHifzScore(s.hifzScore);
        if (s.tajweedScore) setTajweedScore(s.tajweedScore);
        if (s.adabScore) setAdabScore(s.adabScore);
        if (s.quranFont) setQuranFont(s.quranFont);
        if (s.quranFontSize) setQuranFontSize(s.quranFontSize);
        if (s.riwaya) setRiwaya(s.riwaya);
        if (s.theme) setTheme(s.theme);
        if (s.defaultSessionType) setDefaultSessionType(s.defaultSessionType);
        if (s.errorDeductions) {
          setErrorDeductions({ ...baseDeductions, ...s.errorDeductions });
        } else {
          setErrorDeductions(baseDeductions);
        }
      } else {
        setErrorDeductions(baseDeductions);
      }
    });
  }, [currentUserId]);

  const handleUpdateProfile = async () => {
    if (!currentUserId || !profileName.trim()) return;
    try {
      await updateUser(currentUserId, { name: profileName });
      localStorage.setItem('user_name', profileName);
      setPasswordSuccess('حُدثت البيانات الشخصية بنجاح');
      setTimeout(() => setPasswordSuccess(''), 3000);
    } catch(err) {
      setPasswordError('حدث خطأ في أثناء تحديث البيانات');
    }
  };

  const handleUpdatePassword = async () => {
    setPasswordError('');
    setPasswordSuccess('');
    if (newPassword !== confirmPassword) {
      setPasswordError('كلمتا المرور غير متطابقتين');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('يجب أن تتكون كلمة المرور من 6 أحرف على الأقل');
      return;
    }
    try {
      await updatePassword(newPassword);
      setPasswordSuccess('غُيرت كلمة المرور بنجاح');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError('حدث خطأ أثناء تغيير كلمة المرور. يُرجى تسجيل الخروج والدخول مجدداً ثم المحاولة.');
    }
  };

  const handleSave = async () => {
    try {
      await updateSettings({
        hifzScore,
        tajweedScore,
        adabScore,
        quranFont,
        quranFontSize,
        riwaya,
        theme,
        defaultSessionType,
        errorDeductions,
      });
      alert('حُفظ الإعدادات بنجاح');
    } catch (err) {
      console.error(err);
      alert('حدث خطأ في أثناء الحفظ');
    }
  };

  const updateDeduction = (id: string, val: string) => {
    setErrorDeductions(prev => ({ ...prev, [id]: val }));
  };

  const handleAddCustomError = async () => {
    if (!newErrorName.trim()) return;
    try {
      const newErr: Omit<ErrorType, 'id'> = {
        name: newErrorName,
        category: newErrorCategory,
        default_deduction: Number(newErrorDeduction),
        color: 'text-gray-600 bg-gray-50'
      };
      const id = await addCustomErrorType(newErr);
      const created = { ...newErr, id } as ErrorType;
      setCustomErrors([...customErrors, created]);
      setErrorDeductions(prev => ({ ...prev, [id]: newErrorDeduction }));
      setNewErrorName('');
      setNewErrorDeduction('1');
    } catch (err) {
      console.error(err);
      alert('حدث خطأ في أثناء الإضافة');
    }
  };

  const handleDeleteCustomError = async (id: string) => {
    if (!confirm('هل أنت متيقن من حذف هذا الخطأ؟')) return;
    try {
      await deleteCustomErrorType(id);
      setCustomErrors(customErrors.filter(e => e.id !== id));
      const newDeductions = { ...errorDeductions };
      delete newDeductions[id];
      setErrorDeductions(newDeductions);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTeacher = async () => {
    if(!newUserName || !newUserEmail || newUserPassword.length < 6) return;
    setCreatingUser(true);
    try {
      const authUser = await createSecondaryUser(newUserEmail, newUserPassword);
      const newUserDoc: UserType = {
        id: authUser.uid,
        name: newUserName,
        email: newUserEmail,
        role: 'teacher',
        permissions: newUserPermissions,
        created_at: new Date().toISOString(),
        is_active: true
      };
      await addUser(newUserDoc);
      setUsers([newUserDoc, ...users]);
      setShowAddUserModal(false);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserPermissions({ can_add_students: false, can_delete_students: false, can_edit_settings: false });
    } catch(err: any) {
      console.error(err);
      alert('خطأ في أثناء إضافة المشرف: ' + err.message);
    } finally {
      setCreatingUser(false);
    }
  };

  const handleTogglePermission = async (userId: string, permission: keyof UserType['permissions']) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    const currentPerms = user.permissions || { can_add_students: false, can_delete_students: false, can_edit_settings: false };
    const newPerms = { ...currentPerms, [permission]: !currentPerms[permission] };
    
    try {
      await updateUser(userId, { permissions: newPerms });
      setUsers(users.map(u => u.id === userId ? { ...u, permissions: newPerms } : u));
    } catch(err) {
      console.error("Failed to update permission");
    }
  };

  const allErrors = [...DEFAULT_ERROR_TYPES, ...customErrors];

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">الإعدادات</h1>
          <p className="text-gray-500">تخصيص النظام، الصلاحيات، وقيم التقييم</p>
        </div>
        {!viewer && (
          <button
            onClick={handleSave}
            className="bg-primary-900 hover:bg-primary-800 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <Save size={20} />
            <span className="hidden sm:inline">حفظ التعديلات</span>
          </button>
        )}
      </div>

      <div className="space-y-8">
        
        {/* حساب المسؤول / الشيخ */}
        {!viewer && (
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-50">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
              <User className="text-primary-900" size={24} />
              <h2 className="text-xl font-bold text-gray-800">
                {role === 'admin' ? 'إعدادات حساب المسؤول' : 'إعدادات حساب الشيخ'}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="font-bold text-gray-700">البيانات الشخصية</h3>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">الاسم</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={e => setProfileName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary-900"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={myProfile?.email || ''}
                    disabled
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
                    dir="ltr"
                  />
                </div>
                <button
                  onClick={handleUpdateProfile}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-900 px-6 py-3 rounded-xl font-bold transition-colors w-full"
                >
                  تحديث البيانات
                </button>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-gray-700">تغيير كلمة المرور</h3>
                {passwordError && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100">{passwordError}</div>}
                {passwordSuccess && <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl text-sm font-bold border border-emerald-100">{passwordSuccess}</div>}
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center gap-2"><Lock size={16}/> كلمة المرور الجديدة</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary-900"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center gap-2"><Lock size={16}/> تأكيد كلمة المرور</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary-900"
                    dir="ltr"
                  />
                </div>
                <button
                  onClick={handleUpdatePassword}
                  disabled={!newPassword || newPassword !== confirmPassword}
                  className="bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-xl font-bold transition-colors w-full disabled:opacity-50"
                >
                  تحديث كلمة المرور
                </button>
              </div>
            </div>
          </div>
        )}

        {/* إدارة المشايخ والصلاحيات - Admin Only */}
        {role === 'admin' && (
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-50">
            <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <Shield className="text-primary-900" size={24} />
                <h2 className="text-xl font-bold text-gray-800">إدارة المشايخ والصلاحيات</h2>
              </div>
              <button
                onClick={() => setShowAddUserModal(true)}
                className="bg-primary-50 text-primary-900 hover:bg-primary-100 px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-colors text-sm"
              >
                <Plus size={18} />
                إضافة مشرف / شيخ
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-sm">
                    <th className="p-4 rounded-r-xl font-medium">الاسم</th>
                    <th className="p-4 font-medium">البريد الإلكتروني</th>
                    <th className="p-4 font-medium">إضافة طلاب</th>
                    <th className="p-4 font-medium">حذف طلاب</th>
                    <th className="p-4 rounded-l-xl font-medium">تعديل الإعدادات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.filter(u => u.role === 'teacher').map(user => (
                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 font-bold text-gray-800">{user.name}</td>
                      <td className="p-4 text-gray-500" dir="ltr">{user.email}</td>
                      <td className="p-4">
                        <input type="checkbox" 
                          checked={user.permissions?.can_add_students || false}
                          onChange={() => handleTogglePermission(user.id, 'can_add_students')}
                          className="w-5 h-5 rounded text-primary-600 focus:ring-primary-900"
                        />
                      </td>
                      <td className="p-4">
                        <input type="checkbox" 
                          checked={user.permissions?.can_delete_students || false}
                          onChange={() => handleTogglePermission(user.id, 'can_delete_students')}
                          className="w-5 h-5 rounded text-primary-600 focus:ring-primary-900"
                        />
                      </td>
                      <td className="p-4">
                        <input type="checkbox" 
                          checked={user.permissions?.can_edit_settings || false}
                          onChange={() => handleTogglePermission(user.id, 'can_edit_settings')}
                          className="w-5 h-5 rounded text-primary-600 focus:ring-primary-900"
                        />
                      </td>
                    </tr>
                  ))}
                  {users.filter(u => u.role === 'teacher').length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-500">
                        لم يُضف أي شيخ أو مشرف بعد
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* المصحف والعرض */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-50">
          <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
            <BookOpen className="text-primary-900" size={24} />
            <h2 className="text-xl font-bold text-gray-800">إعدادات المصحف والعرض</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-2"><BookOpen size={16}/> الرواية الافتراضية</label>
              <Select 
                value={riwaya} 
                onChange={val => setRiwaya(val)} 
                options={[
                  { value: 'hafs', label: 'حفص عن عاصم' },
                  { value: 'warsh', label: 'ورش عن نافع' },
                  { value: 'qaloon', label: 'قالون عن نافع' },
                  { value: 'shouba', label: 'شعبة عن عاصم' }
                ]}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-2"><Type size={16}/> حجم خط المصحف</label>
              <Select 
                value={quranFontSize} 
                onChange={val => setQuranFontSize(val)} 
                options={[
                  { value: '2xl', label: 'صغير' },
                  { value: '3xl', label: 'متوسط' },
                  { value: '4xl', label: 'كبير (افتراضي)' },
                  { value: '5xl', label: 'كبير جداً' },
                  { value: '6xl', label: 'ضخم' }
                ]}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-2"><Palette size={16}/> المظهر (الثيم)</label>
              <Select 
                value={theme} 
                onChange={val => setTheme(val)} 
                options={[
                  { value: 'light', label: 'عاجي دافئ (افتراضي)' },
                  { value: 'dark', label: 'أزرق ليلي' },
                  { value: 'green', label: 'أخضر زمردي' }
                ]}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-2"><Layout size={16}/> نوع الجلسة الافتراضي</label>
              <Select 
                value={defaultSessionType} 
                onChange={val => setDefaultSessionType(val)} 
                options={[
                  { value: 'حفظ جديد', label: 'حفظ جديد' },
                  { value: 'مراجعة قريبة', label: 'مراجعة قريبة' },
                  { value: 'مراجعة بعيدة', label: 'مراجعة بعيدة' },
                  { value: 'اختبار شامل', label: 'اختبار شامل' }
                ]}
              />
            </div>
          </div>
        </div>

        {/* إعدادات الخصم */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-50">
          <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
            <Sliders className="text-primary-900" size={24} />
            <h2 className="text-xl font-bold text-gray-800">إعدادات الخصم وأنواع الأخطاء</h2>
          </div>
          
          <div className="space-y-8">
            {/* إضافة خطأ جديد */}
            {!viewer && (
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4">إضافة نوع خطأ جديد</h3>
                <div className="flex flex-col sm:flex-row gap-4 items-end">
                  <div className="flex-1 space-y-2 w-full">
                    <label className="block text-sm text-gray-600">اسم الخطأ</label>
                    <input type="text" value={newErrorName} onChange={e => setNewErrorName(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-900" placeholder="مثال: لحن جلي" />
                  </div>
                  <div className="w-full sm:w-48 space-y-2">
                    <label className="block text-sm text-gray-600">التصنيف</label>
                    <Select
                      value={newErrorCategory}
                      onChange={val => setNewErrorCategory(val)}
                      options={[
                        { value: 'حفظ ومراجعة', label: 'حفظ ومراجعة' },
                        { value: 'تجويد وأداء', label: 'تجويد وأداء' },
                        { value: 'أدب وانضباط', label: 'أدب وانضباط' }
                      ]}
                    />
                  </div>
                  <div className="w-full sm:w-32 space-y-2">
                    <label className="block text-sm text-gray-600">الخصم الافتراضي</label>
                    <input type="number" step="0.25" value={newErrorDeduction} onChange={e => setNewErrorDeduction(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-900" />
                  </div>
                  <button onClick={handleAddCustomError} disabled={!newErrorName.trim()} className="w-full sm:w-auto bg-primary-900 hover:bg-primary-800 text-white px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shrink-0">
                    <Plus size={18} /> إضافة
                  </button>
                </div>
              </div>
            )}

            <div>
              <h3 className="text-lg font-bold text-primary-900 mb-4 bg-gray-50 p-3 rounded-xl inline-block">أخطاء الحفظ والمراجعة</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {allErrors.filter(e => e.category === 'حفظ ومراجعة').map(err => (
                  <div key={err.id} className="space-y-1 bg-white p-3 border border-gray-100 rounded-xl shadow-sm relative group">
                    <label className="block text-sm font-bold text-gray-600 pr-6">{err.name}</label>
                    {customErrors.find(c => c.id === err.id) && !viewer && (
                      <button onClick={() => handleDeleteCustomError(err.id)} className="absolute top-2 right-2 text-red-400 hover:text-red-600 p-1 bg-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 size={14} />
                      </button>
                    )}
                    <input
                      type="number"
                      step="0.25"
                      value={errorDeductions[err.id] || err.default_deduction}
                      onChange={(e) => updateDeduction(err.id, e.target.value)}
                      disabled={viewer}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-900 disabled:opacity-70"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-primary-900 mb-4 bg-gray-50 p-3 rounded-xl inline-block">أخطاء التجويد والأداء</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {allErrors.filter(e => e.category === 'تجويد وأداء').map(err => (
                  <div key={err.id} className="space-y-1 bg-white p-3 border border-gray-100 rounded-xl shadow-sm relative group">
                    <label className="block text-sm font-bold text-gray-600 pr-6">{err.name}</label>
                    {customErrors.find(c => c.id === err.id) && !viewer && (
                      <button onClick={() => handleDeleteCustomError(err.id)} className="absolute top-2 right-2 text-red-400 hover:text-red-600 p-1 bg-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 size={14} />
                      </button>
                    )}
                    <input
                      type="number"
                      step="0.25"
                      value={errorDeductions[err.id] || err.default_deduction}
                      onChange={(e) => updateDeduction(err.id, e.target.value)}
                      disabled={viewer}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-900 disabled:opacity-70"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-primary-900 mb-4 bg-gray-50 p-3 rounded-xl inline-block">أخطاء الأدب والانضباط</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {allErrors.filter(e => e.category === 'أدب وانضباط').map(err => (
                  <div key={err.id} className="space-y-1 bg-white p-3 border border-gray-100 rounded-xl shadow-sm relative group">
                    <label className="block text-sm font-bold text-gray-600 pr-6">{err.name}</label>
                    {customErrors.find(c => c.id === err.id) && !viewer && (
                      <button onClick={() => handleDeleteCustomError(err.id)} className="absolute top-2 right-2 text-red-400 hover:text-red-600 p-1 bg-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 size={14} />
                      </button>
                    )}
                    <input
                      type="number"
                      step="0.25"
                      value={errorDeductions[err.id] || err.default_deduction}
                      onChange={(e) => updateDeduction(err.id, e.target.value)}
                      disabled={viewer}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-900 disabled:opacity-70"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">إضافة مشرف / شيخ جديد</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">الاسم</label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={e => setNewUserName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary-900"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={e => setNewUserEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary-900"
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">كلمة المرور (6 أحرف على الأقل)</label>
                <input
                  type="password"
                  value={newUserPassword}
                  onChange={e => setNewUserPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary-900"
                  dir="ltr"
                />
              </div>
              
              <div className="pt-4 border-t border-gray-100 space-y-3">
                <h4 className="font-bold text-gray-800 text-sm mb-2">الصلاحيات المبدئية</h4>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" 
                    checked={newUserPermissions.can_add_students}
                    onChange={(e) => setNewUserPermissions({...newUserPermissions, can_add_students: e.target.checked})}
                    className="w-5 h-5 rounded text-primary-600 focus:ring-primary-900"
                  />
                  <span className="text-sm font-medium text-gray-700">إضافة طلاب جدد</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" 
                    checked={newUserPermissions.can_delete_students}
                    onChange={(e) => setNewUserPermissions({...newUserPermissions, can_delete_students: e.target.checked})}
                    className="w-5 h-5 rounded text-primary-600 focus:ring-primary-900"
                  />
                  <span className="text-sm font-medium text-gray-700">حذف الطلاب</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" 
                    checked={newUserPermissions.can_edit_settings}
                    onChange={(e) => setNewUserPermissions({...newUserPermissions, can_edit_settings: e.target.checked})}
                    className="w-5 h-5 rounded text-primary-600 focus:ring-primary-900"
                  />
                  <span className="text-sm font-medium text-gray-700">تعديل الإعدادات العامة للمنصة</span>
                </label>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 flex justify-end gap-3 rounded-b-3xl">
              <button
                onClick={() => setShowAddUserModal(false)}
                className="px-6 py-2.5 text-gray-600 font-bold hover:bg-gray-200 rounded-xl transition-colors"
                disabled={creatingUser}
              >
                إلغاء
              </button>
              <button
                onClick={handleCreateTeacher}
                disabled={!newUserName || !newUserEmail || newUserPassword.length < 6 || creatingUser}
                className="bg-primary-900 hover:bg-primary-800 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {creatingUser ? 'تجري الإضافة...' : 'حفظ المشرف'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
