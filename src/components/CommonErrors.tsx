import React, { useEffect, useState } from 'react';
import { getStudentSessions, getSessionErrors } from '../lib/db';
import { SessionError } from '../types';
import { AlertCircle } from 'lucide-react';

interface Props {
  studentId: string;
}

export function CommonErrors({ studentId }: Props) {
  const [errors, setErrors] = useState<SessionError[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchErrors = async () => {
      try {
        const sessions = await getStudentSessions(studentId);
        const allErrors: SessionError[] = [];
        for (const s of sessions) {
          const sessErrors = await getSessionErrors(s.id);
          allErrors.push(...sessErrors);
        }
        setErrors(allErrors);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchErrors();
  }, [studentId]);

  if (loading) return null;
  if (errors.length === 0) return null;

  // Group by error type
  const grouped = errors.reduce((acc, err) => {
    acc[err.error_type] = (acc[err.error_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sorted = Object.entries(grouped).sort((a, b) => b[1] - a[1]).slice(0, 5); // top 5

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-50 mb-8">
      <div className="flex items-center gap-2 mb-6">
        <AlertCircle className="text-orange-500" />
        <h3 className="text-xl font-bold text-gray-800">الأخطاء الشائعة مؤخراً</h3>
      </div>
      
      <div className="flex flex-wrap gap-4">
        {sorted.map(([type, count]) => (
          <div key={type} className="bg-orange-50 border border-orange-100 text-orange-800 px-4 py-2 rounded-xl flex items-center gap-3">
            <span className="font-bold">{type}</span>
            <span className="bg-white text-orange-600 text-xs px-2 py-1 rounded-md font-bold">{count} مرات</span>
          </div>
        ))}
      </div>
    </div>
  );
}
