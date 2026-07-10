export interface Student {
  id: string;
  name: string;
  current_level: string;
  current_hifz: string;
  current_review: string;
  assigned_teacher_id: string;
  status: 'active' | 'inactive';
  notes: string;
  created_at: string;
  is_suspended_from_new?: boolean;
}

export type Role = 'admin' | 'teacher' | 'viewer';


export interface TeacherPermissions {
  can_add_students: boolean;
  can_delete_students: boolean;
  can_edit_settings: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'teacher' | 'viewer';
  permissions?: TeacherPermissions;
  created_at: string;
  is_active: boolean;
}


export type SessionType = 'حفظ جديد' | 'مراجعة قريبة' | 'مراجعة بعيدة' | 'اختبار شامل' | 'اختبار شهري';

export interface Session {
  id: string;
  student_id: string;
  teacher_id: string;
  session_type: SessionType;
  start_surah: number;
  start_ayah: number;
  end_surah: number;
  end_ayah: number;
  start_page?: number;
  end_page?: number;
  review_score: number;
  tajweed_score: number;
  adab_score: number;
  total_score: number;
  hifz_mistakes?: number;
  hesitation_mistakes?: number;
  tajweed_mistakes?: number;
  can_take_new_hifz: boolean;
  new_hifz_decision: string;
  notes: string;
  created_at: string;
}

export type ErrorCategory = 'حفظ ومراجعة' | 'تجويد وأداء' | 'أدب وانضباط';

export interface ErrorType {
  id: string;
  name: string;
  category: ErrorCategory;
  default_deduction: number;
  color: string;
}

export interface SessionError {
  id: string;
  session_id: string;
  student_id: string;
  teacher_id: string;
  category: string;
  error_type: string;
  surah_number: number;
  ayah_number: number;
  word_index: number;
  word_text: string;
  letter_index?: number;
  letter_text?: string;
  selection_type: 'ayah' | 'word' | 'letter';
  deduction: number;
  note: string;
  created_at: string;
}

export interface BehaviorNote {
  id: string;
  session_id: string;
  student_id: string;
  teacher_id: string;
  behavior_type: string;
  severity: 'low' | 'medium' | 'high';
  deduction: number;
  note: string;
  created_at: string;
}

export interface WeeklyEvaluation {
  id: string;
  student_id: string;
  week_start: string;
  week_end: string;
  average_review_score: number;
  average_tajweed_score: number;
  average_adab_score: number;
  total_sessions: number;
  total_deficiencies: number;
  common_hifz_errors: string[];
  common_tajweed_errors: string[];
  common_behavior_notes: string[];
  new_hifz_allowed: boolean;
  recommendation: string;
  created_at: string;
}

export interface Permission {
  id: string;
  user_id: string;
  role: Role;
  allowed_student_ids: string[];
  created_at: string;
}


export interface AdabRecord {
  id: string;
  student_id: string;
  date: string;
  score: number;
  notes: string;
  created_at: string;
}


export interface QuestionBankItem {
  id: string;
  question: string;
  answer: string;
  surah_number: number;
  type: 'متشابهات' | 'عام';
  created_at: string;
}