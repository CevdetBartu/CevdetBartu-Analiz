import React, { useState, useEffect } from 'react';
import { fetchWithAuth, removeToken, removeUserEmail } from '../lib/auth';
import { LogOut, Star, User, Bell, Clock, Crown } from 'lucide-react';
import { Header } from '../components/layout/Header';

const BASE = import.meta.env.VITE_API_URL || "";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'profile'|'predictions'|'notifications'>('profile');

  useEffect(() => {
    async function load() {
      const res = await fetchWithAuth(`${BASE}/api/user/me`);
      if (res.ok) {
        setUser(await res.json());
      }
    }
    load();
  }, []);

  function logout() {
    removeToken();
    removeUserEmail();
    window.location.href = '/login';
  }

  if (!user) return <div className="p-8 text-center">Yükleniyor...</div>;

  const isVip = user.membership_plan === 'vip';
  const vipDaysLeft = isVip && user.vip_expires_at 
    ? Math.max(0, Math.ceil((new Date(user.vip_expires_at).getTime() - new Date().getTime()) / (1000 * 3600 * 24)))
    : 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />
      
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <div className="w-full md:w-64 shrink-0 space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full mx-auto mb-4 flex items-center justify-center text-slate-400">
              <User size={32} />
            </div>
            <h2 className="font-bold text-slate-900 truncate">{user.email}</h2>
            {isVip ? (
              <div className="inline-flex items-center gap-1.5 mt-2 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                <Crown size={14} /> VIP Üye
              </div>
            ) : (
              <div className="inline-block mt-2 bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                Standart Üye
              </div>
            )}
          </div>

          <nav className="bg-white rounded-2xl p-2 border border-slate-200 shadow-sm flex flex-col gap-1">
            <button 
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium transition-colors ${activeTab === 'profile' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <User size={18} /> Hesabım
            </button>
            <button 
              onClick={() => setActiveTab('predictions')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium transition-colors ${activeTab === 'predictions' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <Star size={18} /> Tahmin Geçmişim
            </button>
            <button 
              onClick={() => setActiveTab('notifications')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium transition-colors ${activeTab === 'notifications' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <Bell size={18} /> Bildirimler
            </button>
            
            <div className="h-px bg-slate-100 my-2 mx-4"></div>
            
            <button 
              onClick={logout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={18} /> Çıkış Yap
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-6">
          
          {/* VIP Banner */}
          {isVip && (
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white shadow-lg flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2 mb-1"><Crown size={24} /> Premium Aktif</h3>
                <p className="text-amber-100 font-medium">VIP özelliklere sınırsız erişiminiz var.</p>
              </div>
              <div className="bg-white/20 rounded-xl px-5 py-3 text-center backdrop-blur-sm border border-white/20">
                <div className="text-3xl font-black">{vipDaysLeft}</div>
                <div className="text-xs uppercase tracking-wider font-bold opacity-80">Gün Kaldı</div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            {activeTab === 'profile' && (
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-6">Hesap Detayları</h3>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-slate-500 mb-1">E-posta Adresi</label>
                    <input type="text" disabled value={user.email} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-500 mb-1">Kayıt Tarihi</label>
                    <input type="text" disabled value={new Date(user.created_at).toLocaleDateString('tr-TR')} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium cursor-not-allowed" />
                  </div>
                  <div className="pt-4 border-t border-slate-100">
                    <button className="text-blue-600 font-medium text-sm hover:underline">Şifremi Değiştir</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'predictions' && (
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-6">Tahmin Geçmişim</h3>
                <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                  <Clock size={48} className="mx-auto text-slate-300 mb-4" />
                  <p className="font-medium text-lg text-slate-700">Henüz geçmiş bir tahmininiz yok.</p>
                  <p className="text-sm mt-1">Gelecekteki kayıtlı kuponlarınız burada listelenecektir.</p>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-6">Bildirim Tercihleri</h3>
                <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="mt-1">
                    <input type="checkbox" checked={!!user.email_notifications} readOnly className="w-5 h-5 rounded text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Günlük Maç Bülteni</h4>
                    <p className="text-sm text-slate-600 mt-1">Yapay zekanın hazırladığı günün banko maçları ve premium tahminleri her sabah e-posta adresime gönderilsin.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
