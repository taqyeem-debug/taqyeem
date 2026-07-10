import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from './Logo';
import { LayoutDashboard, Users, AlertTriangle, Settings, BookOpen, TrendingUp, LogOut, Menu, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { logout } from '../lib/auth';
import { isViewer } from '../lib/role';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const viewer = isViewer();
  const role = localStorage.getItem('role');
  const permissionsStr = localStorage.getItem('user_permissions');
  const permissions = permissionsStr ? JSON.parse(permissionsStr) : null;
  const canEditSettings = role === 'admin' || (permissions && permissions.can_edit_settings);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    localStorage.removeItem('role');
    try {
      await logout();
    } catch(e) {}
    navigate('/');
  };

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'لوحة التحكم' },
    { to: '/students', icon: Users, label: 'الطلاب' },
    { to: '/reports', icon: AlertTriangle, label: 'النواقص الأسبوعية' },
    { to: '/weekly-eval', icon: TrendingUp, label: 'التقييم الأسبوعي' },
    { to: '/mushaf', icon: BookOpen, label: 'المصحف' },
    { to: '/questions', icon: BookOpen, label: 'مخزون المتشابهات' },
    ...(canEditSettings && !viewer ? [{ to: '/settings', icon: Settings, label: 'الإعدادات' }] : []),
  ];

  const SidebarContent = () => (
    <>
      <div className="p-6 flex items-center gap-3">
        <Logo className="w-24 h-auto mx-auto" />
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all duration-300',
                isActive 
                  ? 'bg-primary-600 text-white font-bold shadow-md shadow-primary-500/20 translate-x-1' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              )
            }
          >
            <item.icon size={20} strokeWidth={2.5} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-2xl text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut size={20} />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-background text-primary-900 overflow-hidden font-sans flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-3">
          <Logo className="w-16 h-auto" />
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-black/50" 
            onClick={() => setMobileMenuOpen(false)}
          ></motion.div>
          <motion.div 
            initial={{ x: '100%' }} 
            animate={{ x: 0 }} 
            exit={{ x: '100%' }} 
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="relative w-64 max-w-sm bg-white flex flex-col h-full shadow-2xl z-50"
          >
            <SidebarContent />
          </motion.div>
        </div>
      )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 bg-white border-l border-gray-100 flex-col shadow-sm z-10">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-y-auto bg-brand-bg relative z-0">
        <div className="max-w-6xl mx-auto w-full p-4 sm:p-6 md:p-8 flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex-1 flex flex-col"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
