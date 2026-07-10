import { collection, doc, getDocs, getDoc, setDoc, addDoc, query, where, orderBy, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { User,   Student, Session, SessionError, ErrorType, BehaviorNote, WeeklyEvaluation, AdabRecord , QuestionBankItem } from '../types';

// Students
export const getStudents = async (): Promise<Student[]> => {
  const q = query(collection(db, 'students'), orderBy('created_at', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Student));
};

export const getStudent = async (id: string): Promise<Student | null> => {
  const d = await getDoc(doc(db, 'students', id));
  return d.exists() ? ({ id: d.id, ...d.data() } as Student) : null;
};

export const addStudent = async (student: Omit<Student, 'id' | 'created_at'>): Promise<string> => {
  const docRef = await addDoc(collection(db, 'students'), {
    ...student,
    created_at: new Date().toISOString(),
  });
  return docRef.id;
};

export const updateStudent = async (id: string, data: Partial<Student>): Promise<void> => {
  await updateDoc(doc(db, 'students', id), data);
};

export const deleteStudent = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'students', id));
};

// Sessions
export const getStudentSessions = async (studentId: string): Promise<Session[]> => {
  const q = query(collection(db, 'sessions'), where('student_id', '==', studentId), orderBy('created_at', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Session));
};

export const addSession = async (session: Omit<Session, 'id'>): Promise<string> => {
  const docRef = await addDoc(collection(db, 'sessions'), session);
  return docRef.id;
};

export const deleteSession = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'sessions', id));
};

// Errors
export const getSessionErrors = async (sessionId: string): Promise<SessionError[]> => {
  const q = query(collection(db, 'errors'), where('session_id', '==', sessionId), orderBy('created_at', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as SessionError));
};

export const addSessionError = async (error: Omit<SessionError, 'id'>): Promise<string> => {
  const docRef = await addDoc(collection(db, 'errors'), error);
  return docRef.id;
};

export const deleteSessionError = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'errors', id));
};

// Behavior Notes
export const addBehaviorNote = async (note: Omit<BehaviorNote, 'id'>): Promise<string> => {
  const docRef = await addDoc(collection(db, 'behavior_notes'), note);
  return docRef.id;
};

export const getSessionBehaviorNotes = async (sessionId: string): Promise<BehaviorNote[]> => {
  const q = query(collection(db, 'behavior_notes'), where('session_id', '==', sessionId), orderBy('created_at', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as BehaviorNote));
};

// Weekly Evaluations
export const getStudentWeeklyEvaluations = async (studentId: string): Promise<WeeklyEvaluation[]> => {
  const q = query(collection(db, 'weekly_evaluations'), where('student_id', '==', studentId), orderBy('created_at', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as WeeklyEvaluation));
};

export const updateSettings = async (settings: any): Promise<void> => {
  await setDoc(doc(db, 'settings', 'global'), settings, { merge: true });
};

export const getSettings = async (): Promise<any> => {
  const d = await getDoc(doc(db, 'settings', 'global'));
  return d.exists() ? d.data() : null;
};

export const updateSession = async (id: string, data: Partial<Session>): Promise<void> => {
  await updateDoc(doc(db, 'sessions', id), data);
};

export const getStudentAdabRecords = async (studentId: string): Promise<AdabRecord[]> => {
  const q = query(collection(db, 'adab_records'), where('student_id', '==', studentId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as AdabRecord));
};

export const addAdabRecord = async (record: Omit<AdabRecord, 'id' | 'created_at'>): Promise<string> => {
  const docRef = await addDoc(collection(db, 'adab_records'), {
    ...record,
    created_at: new Date().toISOString(),
  });
  return docRef.id;
};

export const updateAdabRecord = async (id: string, data: Partial<AdabRecord>): Promise<void> => {
  await updateDoc(doc(db, 'adab_records', id), data);
};


export const getQuestionBank = async (): Promise<QuestionBankItem[]> => {
  const q = query(collection(db, 'question_bank'), orderBy('created_at', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as QuestionBankItem));
};

export const addQuestion = async (q: Omit<QuestionBankItem, 'id' | 'created_at'>): Promise<string> => {
  const docRef = await addDoc(collection(db, 'question_bank'), {
    ...q,
    created_at: new Date().toISOString()
  });
  return docRef.id;
};

export const deleteQuestion = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'question_bank', id));
};
export const getCustomErrorTypes = async (): Promise<ErrorType[]> => {
  const q = query(collection(db, 'error_types'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ErrorType));
};

export const addCustomErrorType = async (type: Omit<ErrorType, 'id'>): Promise<string> => {
  const docRef = await addDoc(collection(db, 'error_types'), type);
  return docRef.id;
};

export const deleteCustomErrorType = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'error_types', id));
};

export const getUsers = async (): Promise<User[]> => {
  const q = query(collection(db, 'users'), orderBy('created_at', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as User));
};

export const getUser = async (id: string): Promise<User | null> => {
  const d = await getDoc(doc(db, 'users', id));
  return d.exists() ? ({ id: d.id, ...d.data() } as User) : null;
};

export const addUser = async (user: User): Promise<void> => {
  await setDoc(doc(db, 'users', user.id), user);
};

export const updateUser = async (id: string, data: Partial<User>): Promise<void> => {
  await updateDoc(doc(db, 'users', id), data);
};

export const deleteUser = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'users', id));
};
