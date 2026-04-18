'use client';
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import api, { getUser } from '@/lib/api';
import toast from 'react-hot-toast';
import { Settings, User, Lock, Bell } from 'lucide-react';

export default function SettingsPage() {
  const user = getUser();
  const [profile, setProfile] = useState({ name: user?.name || '', businessName: user?.businessName || '', email: user?.email || '' });
  const [rate, setRate] = useState({ buyRate: '', sellRate: '' });
  const [balance, setBalance] = useState({ aedCash: '', aedBank: '', tzsCash: '', tzsBank: '', notes: '' });
  const [saving, setSaving] = useState('');

  useEffect(() => {
    api.get('/rates/latest').then(r => {
      if (r.data) setRate({ buyRate: r.data.buyRate?.toString() || '', sellRate: r.data.sellRate?.toString() || '' });
    }).catch(() => {});
    api.get('/balance/latest').then(r => {
      if (r.data) setBalance({ aedCash: r.data.aedCash?.toString() || '', aedBank: r.data.aedBank?.toString() || '', tzsCash: r.data.tzsCash?.toString() || '', tzsBank: r.data.tzsBank?.toString() || '', notes: r.data.notes || '' });
    }).catch(() => {});
  }, []);

  const saveRate = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving('rate');
    try { await api.post('/rates', rate); toast.success('Bei zimehifadhiwa!'); }
    catch { toast.error('Imeshindwa kuhifadhi bei'); }
    finally { setSaving(''); }
  };

  const saveBalance = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving('balance');
    try { await api.post('/balance', balance); toast.success('Salio limehifadhiwa!'); }
    catch { toast.error('Imeshindwa kuhifadhi salio'); }
    finally { setSaving(''); }
  };

  return (
    <Layout>
      <div className="p-6 max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Mipangilio</h1>
          <p className="text-gray-500 text-sm mt-1">Sanidi mfumo wako</p>
        </div>

        <div className="space-y-6">
          {/* Profile */}
          <div className="card">
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 bg-primary-100 rounded-2xl flex items-center justify-center"><User size={20} className="text-primary" /></div>
              <div><h2 className="font-semibold text-gray-900">Taarifa za Akaunti</h2><p className="text-xs text-gray-400">Maelezo ya msingi ya biashara yako</p></div>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Jina Lako</label><input className="input bg-gray-50" value={profile.name} readOnly /></div>
                <div><label className="label">Jina la Biashara</label><input className="input bg-gray-50" value={profile.businessName} readOnly /></div>
              </div>
              <div><label className="label">Barua Pepe</label><input className="input bg-gray-50" value={profile.email} readOnly /></div>
              <p className="text-xs text-gray-400">* Kurekebisha taarifa hizi, wasiliana na msaada wetu</p>
            </div>
          </div>

          {/* Exchange Rate */}
          <div className="card">
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 bg-emerald-100 rounded-2xl flex items-center justify-center"><span className="text-lg">💱</span></div>
              <div><h2 className="font-semibold text-gray-900">Bei ya Kubadilishana</h2><p className="text-xs text-gray-400">Weka bei mpya ya kununua na kuuza AED</p></div>
            </div>
            <form onSubmit={saveRate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Bei ya Kununua (Buy Rate)</label>
                  <div className="relative">
                    <input type="number" step="0.01" className="input pr-16" placeholder="750" value={rate.buyRate} onChange={e => setRate(p => ({ ...p, buyRate: e.target.value }))} />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">TZS</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Bei unayonunulia 1 AED</p>
                </div>
                <div>
                  <label className="label">Bei ya Kuuza (Sell Rate)</label>
                  <div className="relative">
                    <input type="number" step="0.01" className="input pr-16" placeholder="760" value={rate.sellRate} onChange={e => setRate(p => ({ ...p, sellRate: e.target.value }))} />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">TZS</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Bei unayouzia 1 AED</p>
                </div>
              </div>
              {rate.buyRate && rate.sellRate && (
                <div className="bg-primary-50 rounded-xl p-3 text-sm text-primary font-medium">
                  Spread (Faida kwa AED): {(parseFloat(rate.sellRate) - parseFloat(rate.buyRate)).toFixed(2)} TZS
                </div>
              )}
              <button type="submit" disabled={saving === 'rate'} className="btn-primary">
                {saving === 'rate' ? 'Inahifadhi...' : 'Hifadhi Bei'}
              </button>
            </form>
          </div>

          {/* Opening Balance */}
          <div className="card">
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 bg-amber-100 rounded-2xl flex items-center justify-center"><span className="text-lg">💰</span></div>
              <div><h2 className="font-semibold text-gray-900">Salio la Mwanzo (Opening Balance)</h2><p className="text-xs text-gray-400">Weka salio la sasa la fedha zako</p></div>
            </div>
            <form onSubmit={saveBalance} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">AED — Cash (Mkononi)</label>
                  <div className="relative"><input type="number" step="0.01" className="input pr-14" placeholder="0.00" value={balance.aedCash} onChange={e => setBalance(p => ({ ...p, aedCash: e.target.value }))} /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">AED</span></div>
                </div>
                <div>
                  <label className="label">AED — Benki</label>
                  <div className="relative"><input type="number" step="0.01" className="input pr-14" placeholder="0.00" value={balance.aedBank} onChange={e => setBalance(p => ({ ...p, aedBank: e.target.value }))} /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">AED</span></div>
                </div>
                <div>
                  <label className="label">TZS — Cash (Mkononi)</label>
                  <div className="relative"><input type="number" step="1" className="input pr-14" placeholder="0" value={balance.tzsCash} onChange={e => setBalance(p => ({ ...p, tzsCash: e.target.value }))} /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">TZS</span></div>
                </div>
                <div>
                  <label className="label">TZS — Benki</label>
                  <div className="relative"><input type="number" step="1" className="input pr-14" placeholder="0" value={balance.tzsBank} onChange={e => setBalance(p => ({ ...p, tzsBank: e.target.value }))} /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">TZS</span></div>
                </div>
              </div>
              <div><label className="label">Maelezo (si lazima)</label><input className="input" placeholder="Maelezo ya ziada..." value={balance.notes} onChange={e => setBalance(p => ({ ...p, notes: e.target.value }))} /></div>
              <button type="submit" disabled={saving === 'balance'} className="btn-primary">
                {saving === 'balance' ? 'Inahifadhi...' : 'Hifadhi Salio'}
              </button>
            </form>
          </div>

          {/* App Info */}
          <div className="card bg-gradient-to-r from-primary-50 to-white border-primary/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center"><span className="text-2xl">💱</span></div>
              <div>
                <h3 className="font-bold text-gray-900">Dirham Exchange Manager</h3>
                <p className="text-sm text-gray-500">Version 1.0.0 · &copy; 2026 Haki zote zimehifadhiwa</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}