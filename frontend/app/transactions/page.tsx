'use client';
import { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/Layout';
import api, { formatTZS, formatAED, formatDateTime } from '@/lib/api';
import { Plus, Trash2, Filter, X, Search, ArrowUpDown } from 'lucide-react';
import toast from 'react-hot-toast';

type TxType = 'BUY' | 'SELL';

export default function Transactions() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [rate, setRate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    type: 'SELL' as TxType, aedAmount: '', customerId: '', paymentMethod: 'CASH', notes: '', date: ''
  });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const [txRes, custRes, rateRes] = await Promise.all([
        api.get('/transactions' + (filterType ? '?type=' + filterType : '')),
        api.get('/customers'),
        api.get('/rates/latest')
      ]);
      setTransactions(txRes.data);
      setCustomers(custRes.data);
      setRate(rateRes.data);
    } catch { toast.error('Imeshindwa kupakia'); }
    finally { setLoading(false); }
  }, [filterType]);

  useEffect(() => { load(); }, [load]);

  const calcTZS = (aed: string) => {
    if (!aed || !rate) return 0;
    const useRate = form.type === 'SELL' ? rate.sellRate : rate.buyRate;
    return parseFloat(aed) * useRate;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.aedAmount) { toast.error('Jaza kiasi cha AED'); return; }
    setSaving(true);
    try {
      const tzsAmount = calcTZS(form.aedAmount);
      const useRate = form.type === 'SELL' ? rate?.sellRate : rate?.buyRate;
      await api.post('/transactions', { ...form, tzsAmount, rate: useRate });
      toast.success('Muamala umehifadhiwa!');
      setModal(false);
      setForm({ type: 'SELL', aedAmount: '', customerId: '', paymentMethod: 'CASH', notes: '', date: '' });
      load();
    } catch { toast.error('Imeshindwa kuhifadhi'); }
    finally { setSaving(false); }
  };

  const del = async (id: string) => {
    if (!confirm('Futa muamala huu?')) return;
    try {
      await api.delete('/transactions/' + id);
      toast.success('Imefutwa');
      load();
    } catch { toast.error('Imeshindwa kufuta'); }
  };

  const filtered = transactions.filter(tx =>
    !search || tx.customer?.name?.toLowerCase().includes(search.toLowerCase()) || tx.notes?.toLowerCase().includes(search.toLowerCase())
  );

  const totalAed = filtered.reduce((s, t) => s + t.aedAmount, 0);
  const totalProfit = filtered.reduce((s, t) => s + t.profit, 0);

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Miamala</h1>
            <p className="text-gray-500 text-sm mt-1">Rekodi ya kununua na kuuza Dirham</p>
          </div>
          <button onClick={() => setModal(true)} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Muamala Mpya
          </button>
        </div>

        {/* Filters + Search */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="relative flex-1 min-w-48">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input pl-10" placeholder="Tafuta mteja au maelezo..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex bg-white border border-gray-200 rounded-xl p-1 gap-1">
            {[['', 'Zote'], ['BUY', 'Kununua'], ['SELL', 'Kuuza']].map(([val, label]) => (
              <button key={val} onClick={() => setFilterType(val)} className={"px-4 py-2 rounded-lg text-sm font-medium transition-all " + (filterType === val ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Summary bar */}
        <div className="grid grid-cols-3 gap-4 mb-5">
          {[
            { label: 'Jumla ya Miamala', value: filtered.length.toString(), color: 'text-gray-900' },
            { label: 'Jumla AED', value: formatAED(totalAed), color: 'text-primary' },
            { label: 'Jumla Faida', value: formatTZS(totalProfit), color: totalProfit >= 0 ? 'text-emerald-600' : 'text-red-500' },
          ].map(({ label, value, color }) => (
            <div key={label} className="card text-center py-4">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
              <p className={"text-xl font-bold mt-1 " + color}>{value}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Tarehe', 'Aina', 'Mteja', 'AED', 'TZS', 'Bei', 'Faida', 'Malipo', ''].map(h => (
                    <th key={h} className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan={9} className="text-center py-12 text-gray-400">Inapakia...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={9} className="text-center py-16">
                    <ArrowUpDown size={40} className="text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400 font-medium">Hakuna miamala</p>
                    <button onClick={() => setModal(true)} className="btn-primary mt-4 text-sm">Ongeza Muamala wa Kwanza</button>
                  </td></tr>
                ) : filtered.map((tx: any) => (
                  <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 text-sm text-gray-500 whitespace-nowrap">{formatDateTime(tx.date)}</td>
                    <td className="px-5 py-4">
                      <span className={"px-3 py-1 rounded-full text-xs font-bold " + (tx.type === 'BUY' ? 'bg-primary-100 text-primary' : 'bg-emerald-100 text-emerald-700')}>
                        {tx.type === 'BUY' ? '↓ Kununua' : '↑ Kuuza'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-gray-900">{tx.customer?.name || <span className="text-gray-300">—</span>}</td>
                    <td className="px-5 py-4 text-sm font-bold text-primary">{formatAED(tx.aedAmount)}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{formatTZS(tx.tzsAmount)}</td>
                    <td className="px-5 py-4 text-sm text-gray-500">{tx.rate?.toLocaleString()}</td>
                    <td className="px-5 py-4 text-sm font-bold">
                      <span className={tx.profit >= 0 ? 'text-emerald-600' : 'text-red-500'}>
                        {tx.profit >= 0 ? '+' : ''}{formatTZS(tx.profit)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={"px-2 py-1 rounded-lg text-xs font-medium " + (tx.paymentMethod === 'CASH' ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-700')}>
                        {tx.paymentMethod === 'CASH' ? 'Cash' : 'Benki'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button onClick={() => del(tx.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal-box">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Muamala Mpya</h2>
              <button onClick={() => setModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X size={18} /></button>
            </div>
            <form onSubmit={submit} className="p-6 space-y-4">
              {/* Type */}
              <div>
                <label className="label">Aina ya Muamala</label>
                <div className="flex gap-2">
                  {[['SELL', '↑ Kuuza AED', 'bg-emerald-500'], ['BUY', '↓ Kununua AED', 'bg-primary']].map(([val, label, bg]) => (
                    <button type="button" key={val} onClick={() => setForm(p => ({ ...p, type: val as TxType }))}
                      className={"flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all " + (form.type === val ? bg + ' shadow-lg scale-[1.02]' : 'bg-gray-100 text-gray-400')}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              {/* Amount */}
              <div>
                <label className="label">Kiasi cha AED</label>
                <input type="number" step="0.01" className="input" placeholder="Mfano: 1000" required
                  value={form.aedAmount} onChange={e => setForm(p => ({ ...p, aedAmount: e.target.value }))} />
                {form.aedAmount && rate && (
                  <p className="text-xs text-emerald-600 mt-1.5 font-medium">
                    = {formatTZS(calcTZS(form.aedAmount))} (Bei: {form.type === 'SELL' ? rate.sellRate : rate.buyRate} TZS/AED)
                  </p>
                )}
              </div>
              {/* Customer */}
              <div>
                <label className="label">Mteja (si lazima)</label>
                <select className="input" value={form.customerId} onChange={e => setForm(p => ({ ...p, customerId: e.target.value }))}>
                  <option value="">-- Chagua Mteja --</option>
                  {customers.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              {/* Payment */}
              <div>
                <label className="label">Njia ya Malipo</label>
                <div className="flex gap-2">
                  {[['CASH', 'Cash'], ['BANK', 'Benki']].map(([val, label]) => (
                    <button type="button" key={val} onClick={() => setForm(p => ({ ...p, paymentMethod: val }))}
                      className={"flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all " + (form.paymentMethod === val ? 'border-primary bg-primary-50 text-primary' : 'border-gray-100 text-gray-400 hover:border-gray-200')}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              {/* Date */}
              <div>
                <label className="label">Tarehe (si lazima)</label>
                <input type="datetime-local" className="input" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
              </div>
              {/* Notes */}
              <div>
                <label className="label">Maelezo (si lazima)</label>
                <input className="input" placeholder="Maelezo ya ziada..." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
              </div>
              <button type="submit" disabled={saving} className="btn-primary w-full py-3">
                {saving ? 'Inahifadhi...' : 'Hifadhi Muamala'}
              </button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}