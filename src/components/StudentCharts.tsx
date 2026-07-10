import React, { useMemo, useState } from 'react';
import { cn } from '../lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Session } from '../types';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { ar } from 'date-fns/locale';
import { TrendingUp, Activity } from 'lucide-react';

interface Props {
  sessions: Session[];
}

export function StudentCharts({ sessions }: Props) {
  const [timeframe, setTimeframe] = useState<'week' | 'month'>('week');

  const chartData = useMemo(() => {
    if (sessions.length === 0) return [];

    const groups: Record<string, {
      name: string,
      reviewTotal: number,
      tajweedTotal: number,
      adabTotal: number,
      count: number,
      timestamp: number
    }> = {};

    sessions.forEach(s => {
      const d = new Date(s.created_at);
      let key, name, timestamp;
      
      if (timeframe === 'week') {
        const start = startOfWeek(d, { weekStartsOn: 6 });
        const end = endOfWeek(d, { weekStartsOn: 6 });
        key = start.toISOString();
        name = `${format(start, "d MMM", { locale: ar })} - ${format(end, "d MMM", { locale: ar })}`;
        timestamp = start.getTime();
      } else {
        const start = startOfMonth(d);
        key = start.toISOString();
        name = format(start, 'MMMM yyyy', { locale: ar });
        timestamp = start.getTime();
      }
      
      if (!groups[key]) {
        groups[key] = {
          name,
          reviewTotal: 0,
          tajweedTotal: 0,
          adabTotal: 0,
          count: 0,
          timestamp
        };
      }
      
      groups[key].reviewTotal += s.review_score;
      groups[key].tajweedTotal += s.tajweed_score;
      groups[key].adabTotal += s.adab_score;
      groups[key].count += 1;
    });

    const result = Object.values(groups).map(g => ({
      name: g.name,
      timestamp: g.timestamp,
      review: Number((g.reviewTotal / g.count).toFixed(1)),
      tajweed: Number((g.tajweedTotal / g.count).toFixed(1)),
      adab: Number((g.adabTotal / g.count).toFixed(1))
    }));

    return result.sort((a, b) => a.timestamp - b.timestamp);
  }, [sessions, timeframe]);

  if (chartData.length === 0) return null;

  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 mb-8 overflow-hidden">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
             <Activity className="text-primary-600" size={24} />
             متوسط الأداء {timeframe === 'week' ? 'الأسبوعي' : 'الشهري'}
          </h3>
          <p className="text-gray-500 mt-1">تتبع التطور {timeframe === 'week' ? 'الأسبوعي' : 'الشهري'} لمستوى الحفظ والمراجعة</p>
        </div>
        <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
          <button 
            onClick={() => setTimeframe('week')}
            className={cn("px-5 py-2.5 rounded-xl text-sm font-bold transition-all", timeframe === 'week' ? "bg-white text-primary-900 shadow-sm border border-gray-200/50" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100")}
          >
            أسبوعي
          </button>
          <button 
            onClick={() => setTimeframe('month')}
            className={cn("px-5 py-2.5 rounded-xl text-sm font-bold transition-all", timeframe === 'month' ? "bg-white text-primary-900 shadow-sm border border-gray-200/50" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100")}
          >
            شهري
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="h-[350px] relative bg-gray-50/50 p-4 sm:p-6 rounded-3xl border border-gray-100/50">
          <h4 className="text-sm font-bold text-gray-700 mb-6 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
            المراجعة (من 30)
          </h4>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 40 }}>
              <defs>
                <linearGradient id="colorReview" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280", fontWeight: "600" }} dy={15} angle={-35} textAnchor="end" />
              <YAxis orientation="right" domain={[0, 30]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280", fontWeight: "600" }} dx={10} />
              <Tooltip 
                contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', padding: '12px' }}
                labelStyle={{ fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem', fontSize: '0.875rem' }}
                itemStyle={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#10b981' }}
              />
              <Area type="monotone" dataKey="review" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorReview)" name="متوسط المراجعة" activeDot={{ r: 6, strokeWidth: 0, fill: "#10b981" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="h-[350px] relative bg-gray-50/50 p-4 sm:p-6 rounded-3xl border border-gray-100/50">
          <h4 className="text-sm font-bold text-gray-700 mb-6 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-primary-500 shadow-sm shadow-primary-500/50"></span>
            التجويد والأداء (من 10)
          </h4>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 40 }}>
              <defs>
                <linearGradient id="colorTajweed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280", fontWeight: "600" }} dy={15} angle={-35} textAnchor="end" />
              <YAxis orientation="right" domain={[0, 10]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280", fontWeight: "600" }} dx={10} />
              <Tooltip 
                contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', padding: '12px' }}
                labelStyle={{ fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem', fontSize: '0.875rem' }}
                itemStyle={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#3b82f6' }}
              />
              <Area type="monotone" dataKey="tajweed" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorTajweed)" name="متوسط التجويد" activeDot={{ r: 6, strokeWidth: 0, fill: "#3b82f6" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
