'use client';
import { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/Layout';
import StatCard from '@/components/StatCard';
import api, { formatTZS, formatAED, formatDateTime, getUser } from '@/lib/api';
import { TrendingUp, TrendingDown, ArrowLeftRight, DollarSign, Receipt, CreditCard, RefreshCw, Plus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function Dashboard() {
  const [summary, setSummary] = useState<any>(null);
  const [rate, setRate] = useState<any>(null);
  const [balance, setBalance] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day');
  const [loading, setLoading] = useState(true);
  const [rateForm, setRateForm] = useState({ buyRate: '', sellRate: '' });
  const [savingRate, setSavingRate] = useState(false);
  const user = getUser();

  const load = useCallback(async () => {
    try {
      const [summaryRes, rateRes, balanceRes, txRes] = await Promise.all([
        api.get('/reports/summary?period=' + period),
        api.get('/rates/latest'),
        api.get('/balance/latest'),
        api.get('/transactions?limit=5')
      ]);
      setSummary(summaryRes.data);
      setRate(rateRes.data);
      setBalance(balanceRes.data);
      setTransactions(txRes.data.slice(0, 5));
      if (rateRes.data) {
        setRateForm({ buyRate: rateRes.data.buyRate?.toString() || '', sellRate: rateRes.data.sellRate?.toString() || '' });
      }
    } catch { toast.error('Imeshindwa kupakia data'); }
    finally { setLoading(false); }
  }, [period]);

  useEffect(() => { load(); }, [load]);

  const saveRate = async () => {
    if (!rateForm.buyRate || !rateForm.sellRate) { toast.error('Jaza bei zote'); return; }
    setSavingRate(true);
    try {
      await api.post('/rates', rateForm);
      toast.success('Bei zimehifadhiwa!');
      load();
    } catch { toast.error('Imeshindwa kuhifadhi bei'); }
    finally { setSavingRate(false); }
  };

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Inapakia...</p>
        </div>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Habari, {user?.name?.split(' ')[0]}! 👋</h1>
            <p className="text-gray-500 text-sm mt-1">{user?.businessName} · {new Date().toLocaleDateString('sw-TZ', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Period selector */}
            <div className="flex bg-white border border-gray-200 rounded-xl p-1 gap-1">
              {(['day', 'week', 'month'] as const).map(p => (
                <button key={p} onClick={() => setPeriod(p)} className={"px-4 py-2 rounded-lg text-xs font-semibold transition-all " + (period === p ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
                  {p === 'day' ? 'Leo' : p === 'week' ? 'Wiki' : 'Mwezi'}
                </button>
              ))}
            </div>
            <button onClick={load} className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              <RefreshCw size={16} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Exchange Rate Card */}
        <div className="card mb-6 border-primary/20 bg-gradient-to-r from-primary-50 to-white">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Bei ya Sasa — AED / TZS</h2>
              <div className="flex items-center gap-8">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Kununua (Buy)</p>
                  <p className="text-3xl font-bold text-primary">{rate?.buyRate ? rate.buyRate.toLocaleString() : '—'}</p>
                  <p className="text-xs text-gray-400 mt-0.5">TZS kwa 1 AED</p>
                </div>
                <div className="w-px h-16 bg-gray-200" />
                <div>
                  <p className="text-xs text-gray-400 mb-1">Kuuza (Sell)</p>
                  <p className="text-3xl font-bold text-emerald-600">{rate?.sellRate ? rate.sellRate.toLocaleString() : '—'}</p>
                  <p className="text-xs text-gray-400 mt-0.5">TZS kwa 1 AED</p>
                </div>
                <div className="w-px h-16 bg-gray-200" />
                <div>
                  <p className="text-xs text-gray-400 mb-1">Tofauti (Spread)</p>
                  <p className="text-3xl font-bold text-amber-600">
                    {rate?.sellRate && rate?.buyRate ? (rate.sellRate - rate.buyRate).toFixed(0) : '—'}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">TZS faida/AED</p>
                </div>
              </div>
            </div>
            <div className="flex items-end gap-2 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div>
                <label className="label">Bei ya Kununua</label>
                <input type="number" className="input w-32" placeholder="750" value={rateForm.buyRate} onChange={e => setRateForm(p => ({ ...p, buyRate: e.target.value }))} />
              </div>
              <div>
                <label className="label">Bei ya Kuuza</label>
                <input type="number" className="input w-32" placeholder="760" value={rateForm.sellRate} onChange={e => setRateForm(p => ({ ...p, sellRate: e.target.value }))} />
              </div>
              <button onClick={saveRate} disabled={savingRate} className="btn-primary whitespace-nowrap">
                {savingRate ? '...' : 'Hifadhi Bei'}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard title="Faida Ghafi" value={formatTZS(summary?.totalProfit || 0)} subtitle={"Miamala " + (summary?.totalTransactions || 0)} icon={TrendingUp} color="blue" />
          <StatCard title="Gharama" value={formatTZS(summary?.totalExpenses || 0)} icon={Receipt} color="red" />
          <StatCard title="Faida Halisi" value={formatTZS(summary?.netProfit || 0)} subtitle="Baada ya gharama" icon={DollarSign} color="green" />
          <StatCard title="AED Iliyouzwa" value={formatAED(summary?.totalAedSold || 0)} subtitle={"Iliyonunuliwa: " + formatAED(summary?.totalAedBought || 0)} icon={ArrowLeftRight} color="purple" />
        </div>

        {/* Balance Cards */}
        {balance && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'AED Cash', value: formatAED(balance.aedCash), color: 'bg-primary-600' },
              { label: 'AED Bank', value: formatAED(balance.aedBank), color: 'bg-primary-400' },
              { label: 'TZS Cash', value: formatTZS(balance.tzsCash), color: 'bg-emerald-600' },
              { label: 'TZS Bank', value: formatTZS(balance.tzsBank), color: 'bg-emerald-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="card text-center">
                <div className={"w-3 h-3 rounded-full " + color + " mx-auto mb-2"} />
                <p className="text-xs text-gray-400 font-medium">{label}</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Chart + Recent Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Chart */}
          <div className="lg:col-span-3 card">
            <h3 className="font-semibold text-gray-900 mb-4">Faida za Siku 7 Zilizopita</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={summary?.dailyData || []} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={(v) => (v/1000).toFixed(0) + 'k'} />
                <Tooltip formatter={(v: any) => [formatTZS(v), '']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="profit" fill="#2530F8" radius={[6, 6, 0, 0]} name="Faida" />
                <Bar dataKey="expenses" fill="#ef4444" radius={[6, 6, 0, 0]} name="Gharama" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Transactions */}
          <div className="lg:col-span-2 card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Miamala ya Hivi Karibuni</h3>
              <Link href="/transactions" className="text-xs text-primary font-medium hover:underline">Ona Yote →</Link>
            </div>
            <div className="space-y-3">
              {transactions.length === 0 && (
                <div className="text-center py-8">
                  <ArrowLeftRight size={32} className="text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Hakuna miamala bado</p>
                  <Link href="/transactions" className="btn-primary mt-3 inline-flex items-center gap-1 text-xs py-2">
                    <Plus size={14} /> Ongeza Muamala
                  </Link>
                </div>
              )}
              {transactions.map((tx: any) => (
                <div key={tx.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-primary-50 transition-colors">
                  <div className={"w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0 " + (tx.type === 'BUY' ? 'bg-primary' : 'bg-emerald-500')}>
                    {tx.type === 'BUY' ? '↓' : '↑'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{tx.customer?.name || 'Mteja'}</p>
                    <p className="text-xs text-gray-400">{formatDateTime(tx.date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{formatAED(tx.aedAmount)}</p>
                    <p className={"text-xs font-medium " + (tx.profit >= 0 ? 'text-emerald-600' : 'text-red-500')}>
                      {tx.profit >= 0 ? '+' : ''}{formatTZS(tx.profit)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Loans Alert */}
        {(summary?.pendingLoansGiven > 0 || summary?.pendingLoansReceived > 0) && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {summary.pendingLoansGiven > 0 && (
              <div className="card border-amber-200 bg-amber-50">
                <div className="flex items-center gap-3">
                  <CreditCard className="text-amber-500" size={20} />
                  <div>
                    <p className="text-sm font-semibold text-amber-800">Mikopo Iliyotolewa (Haijareudi)</p>
                    <p className="text-xl font-bold text-amber-700 mt-0.5">{formatTZS(summary.pendingLoansGiven)}</p>
                  </div>
                </div>
              </div>
            )}
            {summary.pendingLoansReceived > 0 && (
              <div className="card border-red-200 bg-red-50">
                <div className="flex items-center gap-3">
                  <CreditCard className="text-red-500" size={20} />
                  <div>
                    <p className="text-sm font-semibold text-red-800">Madeni Ninayodaiwa (Haijalipiwa)</p>
                    <p className="text-xl font-bold text-red-700 mt-0.5">{formatTZS(summary.pendingLoansReceived)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}