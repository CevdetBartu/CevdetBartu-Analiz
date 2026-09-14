import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'wouter';
import { fetchWithAuth, getUserEmail, removeToken, removeUserEmail } from '../lib/auth';
import { User, LogOut, Key, Trash2, Calendar, Crown, Shield } from 'lucide-react';

const BASE = import.meta.env.VITE_API_URL || "";

export default function DashboardPage() {
  const [, setLocation] = useLocation();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwdMsg, setPwdMsg] = useState('');
  
  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetchWithAuth(${BASE}/api/auth/me);
        if (!res.ok) {
          throw new Error('Kullanici bilgileri alinamadi. Lutfen tekrar giris yapin.');
        }
        const data = await res.json();
        setUserData(data.user);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const handleLogout = () => {
    removeToken();
    removeUserEmail();
    setLocation('/login');
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg('');
    try {
      const res = await fetchWithAuth(${BASE}/api/auth/me/password, {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Sifre degistirilemedi');
      setPwdMsg('Sifreniz basariyla guncellendi.');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      setPwdMsg(err.message);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Yukleniyor...</div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8">
      <Helmet>
        <title>Hesabim - KargaTahmin</title>
      </Helmet>
      
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Hesabim</h1>
            <p className="text-slate-500 dark:text-slate-400">Uyelik bilgilerinizi buradan yonetebilirsiniz.</p>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 transition-colors">
            <LogOut size={18} />
            <span>Cikis Yap</span>
          </button>
        </div>

        {error && <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}

        {userData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Profil Bilgileri */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><User size={20} /> Profil Bilgileri</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-500 dark:text-slate-400">E-Posta Adresi</label>
                    <div className="mt-1 text-lg font-medium text-slate-900 dark:text-white">{userData.email}</div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-500 dark:text-slate-400">Kayit Tarihi</label>
                    <div className="mt-1 flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <Calendar size={16} />
                      {new Date(userData.created_at).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-500 dark:text-slate-400">Durum</label>
                    <div className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">
                      <Shield size={14} />
                      {userData.membership_status === 'active' ? 'Aktif Uye' : userData.membership_status}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sifre Degistir */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><Key size={20} /> Sifre Degistir</h2>
                <form onSubmit={handlePasswordChange} className="space-y-4 max-w-sm">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Mevcut Sifre</label>
                    <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Yeni Sifre</label>
                    <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white" minLength={8} required />
                  </div>
                  <button type="submit" className="px-4 py-2 bg-slate-900 text-white dark:bg-indigo-600 rounded-lg hover:opacity-90 transition-opacity">Sifreyi Guncelle</button>
                  {pwdMsg && <p className="text-sm font-medium mt-2 text-indigo-600 dark:text-indigo-400">{pwdMsg}</p>}
                </form>
              </div>
            </div>

            {/* Uyelik Plani (Placeholder) */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-indigo-100 dark:border-indigo-800/30">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
                  <Crown size={24} />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Mevcut Plan: Ucretsiz</h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
                  Su anda tum KargaTahmin analiz ozelliklerine ucretsiz erisiyorsunuz. Ilerleyen donemde gelismis ozellikler icin planinizi yukseltebileceksiniz.
                </p>
                <button disabled className="w-full py-2.5 px-4 bg-indigo-600/50 text-white rounded-lg font-medium cursor-not-allowed">
                  Plan Yukselt (Yakinda)
                </button>
              </div>

              <div className="bg-red-50 dark:bg-red-900/10 rounded-xl p-6 border border-red-100 dark:border-red-900/20">
                <h3 className="text-red-800 dark:text-red-400 font-bold mb-2 flex items-center gap-2"><Trash2 size={18} /> Tehlikeli Bolge</h3>
                <p className="text-red-600/80 dark:text-red-400/80 text-sm mb-4">Hesabinizi silerseniz bu islem geri alinamaz.</p>
                <button onClick={() => {
                  if(window.confirm('Hesabinizi kalici olarak silmek istediginize emin misiniz?')) {
                    fetchWithAuth(BASE + '/api/auth/me', { method: 'DELETE' }).then(() => handleLogout());
                  }
                }} className="text-sm text-red-600 dark:text-red-400 font-medium hover:underline">
                  Hesabimi Kalici Olarak Sil
                </button>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
