'use client';
import { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/Layout';
import api, { formatTZS, formatDate } from '@/lib/api';
import { Plus, Trash2, X, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Loans() {
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'GIVEN' | 'RECEIVED'>('GIVEN');
  const [modal, setModal] = useState(false);
  const [payModal, setPayModal] = useState<any>(null);
  const [form, setForm] = useState({ type: 'GIVEN', personName: '', phone: '', amount: '', currency: 'TZS', dueDate: '', notes: '' });
  const [payAmount, setPayAmount] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try { const { data } = await api.get('/loans?type=' + tab); setLoans(data); }
    catch { toast.error('Imeshindwa kupakia'); }
    finally { setLoading(false); }
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.personName || !form.amount) { toast.error('Jaza jina na kiasi'); return; }
    setSaving(true);
    try {
      await api.post('/loans', { ...form, type: tab });
      toast.success('Imehifadhiwa!');
      setModal(false);
      setForm({ type: 'GIVEN', personName: '', phone: '', amount: '', currency: 'TZS', dueDate: '', notes: '' });
      load();
    } catch { toast.error('Imeshindwa kuhifadhi'); }
    finally { setSaving(false); }
  };

  const recordPayment = async () => {
    if (!payAmount || !payModal) return;
    try {
      await api.patch('/loans/' + payModal.id + '/pay', { paidAmount: parseFloat(payAmount) });
      toast.success('Malipo yamerekodiwa!');
      setPayModal(null);
      setPayAmount('');
      load();
    } catch { toast.error('Imeshindwa kurekodi'); }
  };

  const del = async (id: string) => {
    if (!confirm('Futa rekodi hii?')) return;
    try { await api.delete('/loans/' + id); toast.success('Imefutwa'); load(); }
    catch { toast.error('Imeshindwa kufuta'); }
  };

  const totalPending = loans.filter(l => l.status !== 'PAID').reduce((s, l) => s + (l.amount - l.paidAmount), 0);

  const statusBadge = (status: string) => {
    if (status === 'PAID') return <span className="badge-green"><CheckCircle size={11} />Amelipa</span>;
    if (status === 'PARTIAL') return <span className="badge-yellow"><AlertCircle size={11} />Sehemu</span>;
    return <span className="badge-red"><AlertCircle size={11} />Hajalipa</span>;
  };

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Madeni & Mikopo</h1>
            <p className="text-gray-500 text-sm mt-1">Rekodi ya mikopo na madeni yako</p>
          </div>
          <button onClick={() => setModal(true)} className="btn-primary flex items-center gap-2"><Plus size={18} /> Rekodi Mpya</button>
        </div>

        {/* Tabs */}
        <div className="flex bg-white border border-gray-200 rounded-2xl p-1 gap-1 mb-6 w-fit">
          {([['GIVEN', '💸 Mikopo Niliyotoa'], ['RECEIVED', '🏦 Madeni Ninayodaiwa']] as const).map(([val, label]) => (
            <button key={val} onClick={() => setTab(val)}
              className={"px-6 py-2.5 rounded-xl text-sm font-semibold transition-all " + (tab === val ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:text-gray-700')}>
              {label}
            </button>
          ))}
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-5">
          <div className="card text-center">
            <p className="label">{tab === 'GIVEN' ? 'Jumla Niliyokopesha' : 'Jumla Ninayodaiwa'}</p>
            <p className="text-2xl font-bold text-primary mt-1">{formatTZS(loans.reduce((s, l) => s + l.amount, 0))}</p>
          </div>
          <div className="card text-center">
            <p className="label">Bado Haijareudi</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{formatTZS(totalPending)}</p>
          </div>
          <div className="card text-center">
            <p className="label">Imereudi / Imelipwa</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{formatTZS(loans.reduce((s, l) => s + l.paidAmount, 0))}</p>
          </div>
        </div>

        {/* Table */}
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Jina', 'Simu', 'Kiasi', 'Kilicholipwa', 'Kinachobaki', 'Mwisho wa Kulipa', 'Hali', ''].map(h => (
                    <th key={h} className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? <tr><td colSpan={8} className="text-center py-10 text-gray-400">Inapakia...</td></tr>
                : loans.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-16">
                    <CreditCard size={40} className="text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400 font-medium">Hakuna rekodi bado</p>
                    <button onClick={() => setModal(true)} className="btn-primary mt-4 text-sm">Ongeza Rekodi ya Kwanza</button>
                  </td></tr>
                ) : loans.map((l: any) => (
                  <tr key={l.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4 text-sm font-semibold text-gray-900">{l.personName}</td>
                    <td className="px-5 py-4 text-sm text-gray-500">{l.phone || '—'}</td>
                    <td className="px-5 py-4 text-sm font-bold text-primary">{l.currency === 'TZS' ? formatTZS(l.amount) : 'AED ' + l.amount}</td>
                    <td className="px-5 py-4 text-sm text-emerald-600 font-medium">{l.currency === 'TZS' ? formatTZS(l.paidAmount) : 'AED ' + l.paidAmount}</td>
                    <td className="px-5 py-4 text-sm font-bold text-red-600">{l.currency === 'TZS' ? formatTZS(l.amount - l.paidAmount) : 'AED ' + (l.amount - l.paidAmount).toFixed(2)}</td>
                    <td className="px-5 py-4 text-sm text-gray-500">{l.dueDate ? formatDate(l.dueDate) : '—'}</td>
                    <td className="px-5 py-4">{statusBadge(l.status)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        {l.status !== 'PAID' && (
                          <button onClick={() => { setPayModal(l); setPayAmount(''); }} className="px-3 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors">
                            Lipa
                          </button>
                        )}
                        <button onClick={() => del(l.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal-box">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold">{tab === 'GIVEN' ? 'Mkopo Nimetoa' : 'Deni Ninayodaiwa'}</h2>
              <button onClick={() => setModal(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X size={18} /></button>
            </div>
            <form onSubmit={submit} className="p-6 space-y-4">
              <div><label className="label">Jina la Mtu *</label><input className="input" placeholder="Jina kamili" required value={form.personName} onChange={e => setForm(p => ({ ...p, personName: e.target.value }))} /></div>
              <div><label className="label">Namba ya Simu</label><input className="input" placeholder="+255 7XX XXX XXX" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Kiasi *</label><input type="number" step="0.01" className="input" placeholder="0.00" required value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} /></div>
                <div><label className="label">Sarafu</label>
                  <select className="input" value={form.currency} onChange={e => setForm(p => ({ ...p, currency: e.target.value }))}>
                    <option value="TZS">TZS</option><option value="AED">AED</option>
                  </select>
                </div>
              </div>
              <div><label className="label">Tarehe ya Kurudisha</label><input type="date" className="input" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} /></div>
              <div><label className="label">Maelezo</label><textarea className="input resize-none" rows={2} placeholder="Maelezo..." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} /></div>
              <button type="submit" disabled={saving} className="btn-primary w-full py-3">{saving ? 'Inahifadhi...' : 'Hifadhi Rekodi'}</button>
            </form>
          </div>
        </div>
      )}

      {/* Pay Modal */}
      {payModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setPayModal(null)}>
          <div className="modal-box">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold">Rekodi Malipo</h2>
              <button onClick={() => setPayModal(null)} className="p-2 hover:bg-gray-100 rounded-xl"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-sm text-gray-500">Mtu: <span className="font-bold text-gray-900">{payModal.personName}</span></p>
                <p className="text-sm text-gray-500 mt-1">Kinachobaki: <span className="font-bold text-red-600">{formatTZS(payModal.amount - payModal.paidAmount)}</span></p>
              </div>
              <div>
                <label className="label">Kiasi Kilicholipwa</label>
                <input type="number" step="0.01" className="input" placeholder="Weka kiasi" value={payAmount} onChange={e => setPayAmount(e.target.value)} />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setPayModal(null)} className="btn-secondary flex-1">Ghairi</button>
                <button onClick={recordPayment} className="btn-primary flex-1">Rekodi Malipo</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}