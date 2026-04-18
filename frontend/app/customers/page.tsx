'use client';
import { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/Layout';
import api, { formatAED, formatDateTime } from '@/lib/api';
import { Plus, Trash2, X, Users, Phone, Mail, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Customers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [txs, setTxs] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', phone: '', email: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/customers');
      setCustomers(data);
    } catch { toast.error('Imeshindwa kupakia'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const loadTxs = async (id: string) => {
    try {
      const { data } = await api.get('/customers/' + id + '/transactions');
      setTxs(data);
    } catch {}
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) { toast.error('Jaza jina la mteja'); return; }
    setSaving(true);
    try {
      await api.post('/customers', form);
      toast.success('Mteja ameongezwa!');
      setModal(false);
      setForm({ name: '', phone: '', email: '', notes: '' });
      load();
    } catch { toast.error('Imeshindwa kuongeza'); }
    finally { setSaving(false); }
  };

  const del = async (id: string) => {
    if (!confirm('Futa mteja huyu?')) return;
    try { await api.delete('/customers/' + id); toast.success('Imefutwa'); load(); }
    catch { toast.error('Imeshindwa kufuta'); }
  };

  const selectCustomer = (c: any) => { setSelected(c); loadTxs(c.id); };

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Wateja</h1>
            <p className="text-gray-500 text-sm mt-1">Rekodi ya wateja wako wote</p>
          </div>
          <button onClick={() => setModal(true)} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Mteja Mpya
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Customer List */}
          <div className="lg:col-span-2 space-y-3">
            {loading ? <div className="card text-center py-10 text-gray-400">Inapakia...</div> :
            customers.length === 0 ? (
              <div className="card text-center py-16">
                <Users size={40} className="text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 font-medium">Hakuna wateja bado</p>
                <button onClick={() => setModal(true)} className="btn-primary mt-4 text-sm">Ongeza Mteja wa Kwanza</button>
              </div>
            ) : customers.map((c: any) => (
              <div key={c.id} onClick={() => selectCustomer(c)}
                className={"card cursor-pointer hover:border-primary/30 hover:shadow-glow transition-all duration-200 " + (selected?.id === c.id ? 'border-primary bg-primary-50' : '')}>
                <div className="flex items-center gap-4">
                  <div className={"w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0 " + (selected?.id === c.id ? 'bg-primary' : 'bg-gray-200 text-gray-500')}>
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{c.name}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      {c.phone && <span className="flex items-center gap-1 text-xs text-gray-400"><Phone size={11} />{c.phone}</span>}
                      <span className="text-xs text-gray-400">{c._count?.transactions || 0} miamala</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChevronRight size={16} className="text-gray-300" />
                    <button onClick={e => { e.stopPropagation(); del(c.id); }} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Customer Detail */}
          <div className="lg:col-span-3">
            {!selected ? (
              <div className="card text-center py-20">
                <Users size={48} className="text-gray-200 mx-auto mb-4" />
                <p className="text-gray-400 font-medium">Chagua mteja kuona historia yake</p>
              </div>
            ) : (
              <div className="card">
                <div className="flex items-center gap-4 pb-5 mb-5 border-b border-gray-100">
                  <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white font-bold text-2xl">
                    {selected.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selected.name}</h2>
                    {selected.phone && <p className="flex items-center gap-1.5 text-sm text-gray-500 mt-1"><Phone size={14} />{selected.phone}</p>}
                    {selected.email && <p className="flex items-center gap-1.5 text-sm text-gray-500"><Mail size={14} />{selected.email}</p>}
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-3">Historia ya Miamala</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {txs.length === 0 ? (
                    <p className="text-center text-gray-400 py-8">Hakuna miamala bado</p>
                  ) : txs.map((tx: any) => (
                    <div key={tx.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className={"w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold " + (tx.type === 'BUY' ? 'bg-primary' : 'bg-emerald-500')}>
                        {tx.type === 'BUY' ? '↓' : '↑'}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{tx.type === 'BUY' ? 'Kununua' : 'Kuuza'} AED</p>
                        <p className="text-xs text-gray-400">{formatDateTime(tx.date)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-primary">{formatAED(tx.aedAmount)}</p>
                        <p className={"text-xs font-medium " + (tx.profit >= 0 ? 'text-emerald-600' : 'text-red-500')}>
                          {tx.profit >= 0 ? '+' : ''}{tx.profit?.toLocaleString()} TZS
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal-box">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold">Mteja Mpya</h2>
              <button onClick={() => setModal(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X size={18} /></button>
            </div>
            <form onSubmit={submit} className="p-6 space-y-4">
              <div><label className="label">Jina Kamili *</label><input className="input" placeholder="Jina la mteja" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
              <div><label className="label">Namba ya Simu</label><input className="input" placeholder="+255 7XX XXX XXX" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
              <div><label className="label">Barua Pepe</label><input type="email" className="input" placeholder="mfano@gmail.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></div>
              <div><label className="label">Maelezo</label><textarea className="input resize-none" rows={3} placeholder="Maelezo ya ziada..." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} /></div>
              <button type="submit" disabled={saving} className="btn-primary w-full py-3">{saving ? 'Inahifadhi...' : 'Ongeza Mteja'}</button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}