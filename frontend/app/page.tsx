'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', businessName: '' });
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) router.push('/dashboard');
  }, [router]);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post(isLogin ? '/auth/login' : '/auth/register', form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      toast.success('Karibu, ' + data.user.name + '!');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Kuna tatizo. Jaribu tena.');
    } finally { setLoading(false); }
  };

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary to-primary-400 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/3 rounded-full blur-3xl" />
      </div>
      <div className="relative w-full max-w-md z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-2xl mb-5 mx-auto">
            <span className="text-4xl">💱</span>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Dirham Exchange</h1>
          <p className="text-white/70 mt-2 text-base">Mfumo wa Kisasa wa Kubadilishana Fedha</p>
        </div>
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="flex bg-gray-100 rounded-2xl p-1 mb-6 gap-1">
            {['Ingia', 'Jisajili'].map((tab, i) => (
              <button key={i} onClick={() => setIsLogin(i === 0)} className={"flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 " + (isLogin === (i === 0) ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:text-gray-700')}>
                {tab}
              </button>
            ))}
          </div>
          <form onSubmit={handle} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="label">Jina Lako Kamili</label>
                  <input className="input" placeholder="Mfano: Ahmed Hassan" required value={form.name} onChange={update('name')} />
                </div>
                <div>
                  <label className="label">Jina la Biashara</label>
                  <input className="input" placeholder="Mfano: Al-Noor Exchange" required value={form.businessName} onChange={update('businessName')} />
                </div>
              </>
            )}
            <div>
              <label className="label">Barua Pepe</label>
              <input type="email" className="input" placeholder="mfano@gmail.com" required value={form.email} onChange={update('email')} />
            </div>
            <div>
              <label className="label">Neno la Siri</label>
              <input type="password" className="input" placeholder="Angalau herufi 8" required minLength={6} value={form.password} onChange={update('password')} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  Subiri...
                </span>
              ) : isLogin ? 'Ingia Sasa →' : 'Tengeneza Akaunti →'}
            </button>
          </form>
          <p className="text-center text-gray-400 text-xs mt-5">
            Kwa kuingia unakubaliana na masharti yetu ya matumizi
          </p>
        </div>
        <p className="text-center text-white/40 text-xs mt-5">
          &copy; 2026 Dirham Exchange Manager
        </p>
      </div>
    </div>
  );
}