'use client';
import { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/Layout';
import api, { formatTZS, formatAED } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, ArrowLeftRight } from 'lucide-react';
import toast from 'react-hot-toast';

const COLORS = ['#2530F8', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function Reports() {
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('week');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data: d } = await api.get('/reports/summary?period=' + period);
      setData(d);
    } catch { toast.error('Imeshindwa kupakia ripoti'); }
    finally { setLoading(false); }
  }, [period]);

  useEffect(() => { load(); }, [load]);

  const pieData = data ? [
    { name: 'Faida', value: Math.max(data.totalProfit, 0) },
    { name: 'Gharama', value: Math.max(data.totalExpenses, 0) },
  ].filter(d => d.value > 0) : [];

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Ripoti</h1>
            <p className="text-gray-500 text-sm mt-1">Muhtasari wa biashara yako</p>
          </div>
          <div className="flex bg-white border border-gray-200 rounded-xl p-1 gap-1">
            {(['day', 'week', 'month'] as const).map(p => (
              <button key={p} onClick={() => setPeriod(p)} className={"px-5 py-2 rounded-lg text-sm font-semibold transition-all " + (period === p ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
                {p === 'day' ? 'Leo' : p === 'week' ? 'Wiki Hii' : 'Mwezi Huu'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : data && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                { title: 'Jumla Miamala', value: data.totalTransactions.toString(), icon: ArrowLeftRight, color: 'blue' as const, sub: 'Miamala iliyofanywa' },
                { title: 'Faida Ghafi', value: formatTZS(data.totalProfit), icon: TrendingUp, color: 'green' as const, sub: 'Kabla ya gharama' },
                { title: 'Jumla Gharama', value: formatTZS(data.totalExpenses), icon: TrendingDown, color: 'red' as const, sub: 'Matumizi yote' },
                { title: 'FAIDA HALISI', value: formatTZS(data.netProfit), icon: DollarSign, color: data.netProfit >= 0 ? 'green' as const : 'red' as const, sub: 'Faida - Gharama' },
              ].map(({ title, value, icon: Icon, color, sub }) => {
                const colors = {
                  blue: 'bg-primary-50 text-primary',
                  green: 'bg-emerald-50 text-emerald-600',
                  red: 'bg-red-50 text-red-600'
                };
                const iconColors = {
                  blue: 'bg-primary text-white',
                  green: 'bg-emerald-500 text-white',
                  red: 'bg-red-500 text-white'
                };
                return (
                  <div key={title} className={"card " + colors[color]}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider opacity-70">{title}</p>
                        <p className="text-2xl font-bold mt-1.5">{value}</p>
                        <p className="text-xs opacity-60 mt-1">{sub}</p>
                      </div>
                      <div className={"w-11 h-11 rounded-2xl flex items-center justify-center " + iconColors[color]}>
                        <Icon size={20} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* AED Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="card">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">AED Iliyonunuliwa</p>
                <p className="text-3xl font-bold text-primary mt-2">{formatAED(data.totalAedBought)}</p>
                <div className="h-2 bg-primary-100 rounded-full mt-3">
                  <div className="h-full bg-primary rounded-full" style={{ width: data.totalAedBought > 0 ? '100%' : '0%' }} />
                </div>
              </div>
              <div className="card">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">AED Iliyouzwa</p>
                <p className="text-3xl font-bold text-emerald-600 mt-2">{formatAED(data.totalAedSold)}</p>
                <div className="h-2 bg-emerald-100 rounded-full mt-3">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: data.totalAedSold > 0 ? '100%' : '0%' }} />
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Bar Chart */}
              <div className="lg:col-span-2 card">
                <h3 className="font-semibold text-gray-900 mb-5">Faida na Gharama (Siku 7)</h3>
                {data.dailyData?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={data.dailyData} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={v => (v/1000).toFixed(0) + 'k'} />
                      <Tooltip formatter={(v: any) => [formatTZS(v), '']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }} />
                      <Legend />
                      <Bar dataKey="profit" fill="#2530F8" radius={[6,6,0,0]} name="Faida" />
                      <Bar dataKey="expenses" fill="#ef4444" radius={[6,6,0,0]} name="Gharama" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <div className="flex items-center justify-center h-64 text-gray-300">Hakuna data</div>}
              </div>

              {/* Pie Chart */}
              <div className="card">
                <h3 className="font-semibold text-gray-900 mb-5">Mgawanyiko wa Mapato</h3>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="45%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                        {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                      </Pie>
                      <Legend />
                      <Tooltip formatter={(v: any) => [formatTZS(v), '']} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-300">
                    <DollarSign size={40} />
                    <p className="text-sm mt-2">Hakuna data ya kuonyesha</p>
                  </div>
                )}
              </div>
            </div>

            {/* Transactions line chart */}
            {data.dailyData?.length > 0 && (
              <div className="card">
                <h3 className="font-semibold text-gray-900 mb-5">Idadi ya Miamala kwa Siku</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={data.dailyData} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }} />
                    <Line type="monotone" dataKey="transactions" stroke="#2530F8" strokeWidth={3} dot={{ fill: '#2530F8', strokeWidth: 0, r: 5 }} name="Miamala" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Loans summary */}
            {(data.pendingLoansGiven > 0 || data.pendingLoansReceived > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {data.pendingLoansGiven > 0 && (
                  <div className="card border-amber-200 bg-gradient-to-r from-amber-50 to-white">
                    <p className="text-sm font-semibold text-amber-700 uppercase tracking-wide">Mikopo Niliyotoa (Haijareudi)</p>
                    <p className="text-3xl font-bold text-amber-600 mt-2">{formatTZS(data.pendingLoansGiven)}</p>
                  </div>
                )}
                {data.pendingLoansReceived > 0 && (
                  <div className="card border-red-200 bg-gradient-to-r from-red-50 to-white">
                    <p className="text-sm font-semibold text-red-700 uppercase tracking-wide">Madeni Ninayodaiwa (Haijalipiwa)</p>
                    <p className="text-3xl font-bold text-red-600 mt-2">{formatTZS(data.pendingLoansReceived)}</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}