import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation, Link } from 'wouter';
import { fetchWithAuth, getUserEmail, removeToken, removeUserEmail } from '../lib/auth';
import { User, LogOut, Key, Trash2, Calendar, Crown, Shield, Target } from 'lucide-react';

const BASE = import.meta.env.VITE_API_URL || "";

export default function DashboardPage() {
  const [, setLocation] = useLocation();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwdMsg, setPwdMsg] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(true);

  
  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetchWithAuth(`${BASE}/api/auth/me`);
        if (!res.ok) {
          throw new Error('Kullanıcı bilgileri alınamadı. Lütfen tekrar giriş yapın.');
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
      const res = await fetchWithAuth(`${BASE}/api/auth/me/password`, {
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Şifre değiştirilemedi');
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
            <p className="text-slate-500 dark:text-slate-400">Üyelik bilgilerinizi buradan yönetebilirsiniz.</p>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 transition-colors">
            <LogOut size={18} />
            <span>Çıkış Yap</span>
          </button>
        </div>

        {error && <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}

        {userData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Yönetim Paneli - Yalnızca Admin */}
            {userData?.role === 'admin' && (
              <div className="md:col-span-3 mb-6 bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6 shadow-sm border border-purple-200 dark:border-purple-800/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-purple-900 dark:text-purple-300 flex items-center gap-2">
                    <Shield size={20} className="text-purple-600 dark:text-purple-400" />
                    Yönetici Yetkilerine Sahipsiniz
                  </h2>
                  <p className="text-purple-700 dark:text-purple-400 mt-1 text-sm">
                    Kullanıcıları yönetmek, veritabanına erişmek ve sistem ayarlarını yapılandırmak için admin panellerini kullanabilirsiniz.
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Link href="/admin/kullanicilar" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg shadow-sm transition-colors text-sm">
                    Kullanıcı Yönetimi
                  </Link>
                  <Link href="/admin" className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 font-medium rounded-lg shadow-sm transition-colors text-sm">
                    Veritabanı
                  </Link>
                </div>
              </div>
            )}

            

            {/* Tahminlerim Kısayolu */}
            <div className="md:col-span-1 space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                  <Target size={20} className="text-emerald-500" /> Tahmin Merkezi
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  Maçlara yaptığınız tahminleri, başarı oranınızı ve geçmiş kuponlarınızı takip edin.
                </p>
                <Link href="/tahminlerim" className="block w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-bold text-center rounded-lg transition-colors border border-emerald-200">
                  Tahmin Geçmişim
                </Link>
              </div>
            </div>
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
                    <label className="block text-sm font-medium text-slate-500 dark:text-slate-400">Kayıt Tarihi</label>
                    <div className="mt-1 flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <Calendar size={16} />
                      {new Date(userData.created_at).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-500 dark:text-slate-400">Durum</label>
                    <div className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">
                      <Shield size={14} />
                      {userData.membership_status === 'active' ? 'Aktif Üye' : userData.membership_status}
                    </div>
                  </div>
                </div>
              </div>


            {/* Bildirim Tercihleri */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 mt-6">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <Mail size={20} className="text-blue-500" /> Bildirim Tercihleri
              </h2>
              <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200">Haftalık E-Posta Bülteni</h3>
                  <p className="text-sm text-slate-500">Tahmin başarı oranlarını ve güncel analizleri e-posta ile alın.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={emailNotifications} onChange={e => handleNotificationToggle(e.target.checked)} />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

              {/* Şifre Değiştir */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><Key size={20} /> Şifre Değiştir</h2>
                <form onSubmit={handlePasswordChange} className="space-y-4 max-w-sm">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Mevcut Şifre</label>
                    <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Yeni Şifre</label>
                    <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white" minLength={8} required />
                  </div>
                  <button type="submit" className="px-4 py-2 bg-slate-900 text-white dark:bg-indigo-600 rounded-lg hover:opacity-90 transition-opacity">Şifreyi Güncelle</button>
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
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Mevcut Plan: Ücretsiz</h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
                  Şu anda tüm KargaTahmin analiz özelliklerine ücretsiz erişiyorsunuz. İlerleyen dönemde gelişmiş özellikler için planınızı yükseltebileceksiniz.
                </p>
                <button disabled className="w-full py-2.5 px-4 bg-indigo-600/50 text-white rounded-lg font-medium cursor-not-allowed">
                  Plan Yükselt (Yakında)
                </button>
              </div>

              <div className="bg-red-50 dark:bg-red-900/10 rounded-xl p-6 border border-red-100 dark:border-red-900/20">
                <h3 className="text-red-800 dark:text-red-400 font-bold mb-2 flex items-center gap-2"><Trash2 size={18} /> Tehlikeli Bölge</h3>
                <p className="text-red-600/80 dark:text-red-400/80 text-sm mb-4">Hesabınızı silerseniz bu işlem geri alınamaz.</p>
                <button onClick={() => {
                  if(window.confirm('Hesabinizi kalici olarak silmek istediginize emin misiniz?')) {
                    fetchWithAuth(BASE + '/api/auth/me', { method: 'DELETE' }).then(() => handleLogout());
                  }
                }} className="text-sm text-red-600 dark:text-red-400 font-medium hover:underline">
                  Hesabımı Kalıcı Olarak Sil
                </button>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
