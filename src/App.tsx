import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import StudentsList from './pages/StudentsList';
import AddStudent from './pages/AddStudent';
import StudentProfile from './pages/StudentProfile';
import NewSession from './pages/NewSession';
import Reports from './pages/Reports';
import WeeklyEval from './pages/WeeklyEval';
import Settings from './pages/Settings';
import Mushaf from './pages/Mushaf';
import { QuestionBank } from './pages/QuestionBank';
import Landing from './pages/Landing';
import Login from './pages/Login';
import { auth } from './lib/auth';
import { onAuthStateChanged, User } from 'firebase/auth';

function PrivateRoute() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // يسمح وضع الزائر بالاستكشاف دون صلاحيات تعديل.
    const visitorRole = localStorage.getItem('role');
    if (visitorRole === 'viewer') {
      setUser({} as User);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf9f6]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-900"></div>
      </div>
    );
  }

  return user ? <Layout /> : <Navigate to="/" replace />;
}

function AnimatedRoutes() {
  const location = useLocation();
  const isLayoutRoute = ['/dashboard', '/students', '/reports', '/weekly-eval', '/settings', '/mushaf'].some(path => location.pathname.startsWith(path));
  const outerKey = isLayoutRoute ? 'layout' : location.pathname;

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={outerKey}>
        <Route path="/" element={
          <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="h-full">
            <Landing />
          </motion.div>
        } />
        <Route path="/login" element={
          <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="h-full">
            <Login />
          </motion.div>
        } />
        
        <Route element={
          <motion.div key="layout" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="h-full">
            <PrivateRoute />
          </motion.div>
        }>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/students" element={<StudentsList />} />
          <Route path="/students/new" element={<AddStudent />} />
          <Route path="/students/:id" element={<StudentProfile />} />
          <Route path="/students/:id/session/new" element={<NewSession />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/weekly-eval" element={<WeeklyEval />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/mushaf" element={<Mushaf />} />
          <Route path="/questions" element={<QuestionBank />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}
