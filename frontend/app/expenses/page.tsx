'use client';
import { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/Layout';
import api, { formatTZS, formatDate } from '@/lib/api';
import { Plus, Trash2, X, Receipt } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = ['Nauli / Usafiri','Chakula','Tozo ya Benki','Mshahara','Pango / Ofisi','Umeme / Maji','Simu / Intaneti','Matangazo','Vifaa vya Ofisi','Nyingine'];

export default function Expenses() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ category: '', amount: '', currency: 'TZS', notes: '', date: '' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try { const { data } = await api.get('/expenses'); setExpenses(data); }
    catch { toast.error('Imeshindwa kupakia'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.category || !form.amount) { toast.error('Jaza aina na kiasi cha gharama'); return; }
    setSaving(true);
    try {
      await api.post('/expenses', form);
      toast.success('Gharama imehifadhiwa!');
      setModal(false);
      setForm({ category: '', amount: '', currency: 'TZS', notes: '', date: '' });
      load();
    } catch { toast.error('Imeshindwa kuhifadhi'); }
    finally { setSaving(false); }
  };

  const del = async (id: string) => {
    if (!confirm('Futa gharama hii?')) return;
    try { await api.delete('/expenses/' + id); toast.success('Imefutwa'); load(); }
    catch { toast.error('Imeshindwa kufuta'); }
  };

  const totalTZS = expenses.filter(e => e.currency === 'TZS').reduce((s, e) => s + e.amount, 0);
  const totalAED = expenses.filter(e => e.currency === 'AED').reduce((s, e) => s + e.amount, 0);

  const catTotals = CATEGORIES.map(cat => ({
    cat,
    total: expenses.filter(e => e.category === cat && e.currency === 'TZS').reduce((s, e) => s + e.amount, 0)
  })).filter(c => c.total > 0).sort((a, b) => b.total - a.total);

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gharama</h1>
            <p className="text-gray-500 text-sm mt-1">Rekodi ya matumizi yako yote</p>
          </div>
          <button onClick={() => setModal(true)} className="btn-primary flex items-center gap-2"><Plus size={18} /> Gharama Mpya</button>
        </div>

        {/* Totals */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="card text-center"><p className="label">Jumla Gharama (TZS)</p><p className="text-2xl font-bold text-red-600 mt-1">{formatTZS(totalTZS)}</p></div>
          <div className="card text-center"><p className="label">Jumla Gharama (AED)</p><p className="text-2xl font-bold text-primary mt-1">AED {totalAED.toFixed(2)}</p></div>
          <div className="card text-center"><p className="label">Idadi ya Rekodi</p><p className="text-2xl font-bold text-gray-900 mt-1">{expenses.length}</p></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Category breakdown */}
          {catTotals.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">Gharama kwa Aina</h3>
              <div className="space-y-3">
                {catTotals.map(({ cat, total }) => (
                  <div key={cat}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600 font-medium truncate">{cat}</span>
                      <span className="text-gray-500 ml-2 whitespace-nowrap">{formatTZS(total)}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: Math.min((total / totalTZS) * 100, 100) + '%' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* List */}
          <div className={"card p-0 overflow-hidden " + (catTotals.length > 0 ? 'lg:col-span-3' : 'lg:col-span-4')}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Tarehe', 'Aina', 'Kiasi', 'Sarafu', 'Maelezo', ''].map(h => (
                      <th key={h} className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? <tr><td colSpan={6} className="text-center py-10 text-gray-400">Inapakia...</td></tr>
                  : expenses.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-16">
                      <Receipt size={40} className="text-gray-200 mx-auto mb-3" />
                      <p className="text-gray-400">Hakuna gharama bado</p>
                      <button onClick={() => setModal(true)} className="btn-primary mt-4 text-sm">Ongeza Gharama</button>
                    </td></tr>
                  ) : expenses.map((e: any) => (
                    <tr key={e.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4 text-sm text-gray-500">{formatDate(e.date)}</td>
                      <td className="px-5 py-4"><span className="badge-blue">{e.category}</span></td>
                      <td className="px-5 py-4 text-sm font-bold text-red-600">{e.currency === 'TZS' ? formatTZS(e.amount) : 'AED ' + e.amount}</td>
                      <td className="px-5 py-4 text-sm text-gray-500">{e.currency}</td>
                      <td className="px-5 py-4 text-sm text-gray-400">{e.notes || '—'}</td>
                      <td className="px-5 py-4">
                        <button onClick={() => del(e.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal-box">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold">Gharama Mpya</h2>
              <button onClick={() => setModal(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X size={18} /></button>
            </div>
            <form onSubmit={submit} className="p-6 space-y-4">
              <div>
                <label className="label">Aina ya Gharama *</label>
                <select className="input" required value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                  <option value="">-- Chagua Aina --</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Kiasi *</label>
                  <input type="number" step="0.01" className="input" placeholder="0.00" required value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Sarafu</label>
                  <select className="input" value={form.currency} onChange={e => setForm(p => ({ ...p, currency: e.target.value }))}>
                    <option value="TZS">TZS</option>
                    <option value="AED">AED</option>
                  </select>
                </div>
              </div>
              <div><label className="label">Tarehe</label><input type="date" className="input" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} /></div>
              <div><label className="label">Maelezo</label><input className="input" placeholder="Maelezo ya gharama..." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} /></div>
              <button type="submit" disabled={saving} className="btn-primary w-full py-3">{saving ? 'Inahifadhi...' : 'Hifadhi Gharama'}</button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}