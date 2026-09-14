import React, { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { SeoHead } from "../components/seo/SeoHead";
import { fetchWithAuth, getUserRole } from "../lib/auth";
import { Users, AlertTriangle, Activity, Trash2, Ban, Shield, ShieldOff, Edit3 } from "lucide-react";

export default function AdminUsersPage() {
  const [, setLocation] = useLocation();
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalUsers: 0, newToday: 0, activeUsers: 0 });
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  const [annTitle, setAnnTitle] = useState("");
  const [annContent, setAnnContent] = useState("");

  useEffect(() => {
    if (getUserRole() !== "admin") {
      setLocation("/");
      return;
    }
    loadData();
  }, [page, search]);

  const loadData = async () => {
    try {
      const [uRes, sRes, aRes, audRes] = await Promise.all([
        fetchWithAuth(`/api/admin/dashboard/users?page=${page}&limit=20&search=${encodeURIComponent(search)}`),
        fetchWithAuth(`/api/admin/dashboard/stats`),
        fetchWithAuth(`/api/admin/dashboard/announcements`),
        fetchWithAuth(`/api/admin/dashboard/audit`)
      ]);
      if (uRes.ok) {
        const uData = await uRes.json();
        setUsers(uData.users);
        setTotalPages(uData.totalPages);
      }
      if (sRes.ok) setStats(await sRes.json());
      if (aRes.ok) setAnnouncements(await aRes.json());
      if (audRes.ok) setAuditLogs(await audRes.json());
    } catch (e) {
      console.error(e);
    }
  };

  const updateUser = async (id: number, payload: any) => {
    if (!confirm("Emin misiniz?")) return;
    await fetchWithAuth(`/api/admin/dashboard/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    });
    loadData();
  };

  const deleteUser = async (id: number) => {
    if (!confirm("Bu kullanıcıyı tamamen silmek istediğinize emin misiniz? (Bu işlem geri alınamaz)")) return;
    await fetchWithAuth(`/api/admin/dashboard/users/${id}`, {
      method: "DELETE"
    });
    loadData();
  };

  const createAnn = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetchWithAuth("/api/admin/dashboard/announcements", {
      method: "POST",
      body: JSON.stringify({ title: annTitle, content: annContent, is_active: true })
    });
    setAnnTitle("");
    setAnnContent("");
    loadData();
  };

  const deleteAnn = async (id: number) => {
    if (!confirm("Silmek istediginizden emin misiniz?")) return;
    await fetchWithAuth(`/api/admin/dashboard/announcements/${id}`, {
      method: "DELETE"
    });
    loadData();
  };
  
  const toggleAnn = async (id: number, current: boolean) => {
    await fetchWithAuth(`/api/admin/dashboard/announcements/${id}`, {
      method: "PUT",
      body: JSON.stringify({ is_active: !current })
    });
    loadData();
  };

  const parseJWT = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch { return {}; }
  };
  const myId = parseJWT(localStorage.getItem('karga_token') || '').userId;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <SeoHead title="Kullanıcı Yönetimi | KargaTahmin" />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg dark:bg-blue-900/30 dark:text-blue-400">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Toplam Üye</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalUsers}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-lg dark:bg-green-900/30 dark:text-green-400">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Bugün Kaydolan</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.newToday}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-lg dark:bg-amber-900/30 dark:text-amber-400">
            <Shield size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Aktif (Bansız) Üye</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.activeUsers}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap gap-4 items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Kullanıcı Listesi</h2>
              <input 
                type="text" 
                placeholder="E-posta ile ara..." 
                className="w-full sm:w-64 px-3 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase font-semibold text-slate-500">
                    <th className="p-4">Email</th>
                    <th className="p-4">Rol & Durum</th>
                    <th className="p-4">Kayıt / Son Giriş</th>
                    <th className="p-4 text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                  {users.map(u => {
                    const isMe = u.id === myId;
                    return (
                      <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="p-4 font-medium text-slate-900 dark:text-slate-100">
                          {u.email}
                          {isMe && <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Sen</span>}
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1">
                            <span className={`inline-block w-fit px-2 py-0.5 rounded text-xs font-semibold ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'}`}>{u.role}</span>
                            {u.is_banned ? <span className="inline-block w-fit px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-700">Yasaklı</span> : null}
                          </div>
                        </td>
                        <td className="p-4 text-slate-500 dark:text-slate-400 text-xs">
                          {new Date(u.created_at).toLocaleDateString("tr-TR")}<br/>
                          Son: {u.last_login_at ? new Date(u.last_login_at).toLocaleDateString("tr-TR") : 'Bilinmiyor'}
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button disabled={isMe} onClick={() => updateUser(u.id, { role: u.role === 'admin' ? 'user' : 'admin' })} className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 disabled:opacity-30" title="Rolü Değiştir">
                            <Shield size={16} />
                          </button>
                          <button disabled={isMe} onClick={() => updateUser(u.id, { is_banned: !u.is_banned })} className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 disabled:opacity-30" title="Banla / Kaldır">
                            <Ban size={16} />
                          </button>
                          <button disabled={isMe} onClick={() => deleteUser(u.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-30" title="Sil">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="p-4 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 text-sm bg-slate-100 dark:bg-slate-800 rounded disabled:opacity-50">Önceki</button>
              <span className="text-sm text-slate-500">Sayfa {page} / {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 text-sm bg-slate-100 dark:bg-slate-800 rounded disabled:opacity-50">Sonraki</button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Yeni Duyuru Ekle</h2>
            <form onSubmit={createAnn} className="space-y-3">
              <input required value={annTitle} onChange={e=>setAnnTitle(e.target.value)} type="text" placeholder="Başlık" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" />
              <textarea required value={annContent} onChange={e=>setAnnContent(e.target.value)} placeholder="Duyuru metni..." className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm min-h-[80px]"></textarea>
              <button type="submit" className="w-full py-2 bg-primary text-white rounded-lg font-medium text-sm">Yayınla</button>
            </form>
            <div className="mt-6 space-y-3">
              <h3 className="font-semibold text-slate-700 dark:text-slate-300">Aktif Duyurular</h3>
              {announcements.map(a => (
                <div key={a.id} className={`p-3 rounded-lg border ${a.is_active ? 'border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-900/20' : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800'}`}>
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-semibold text-sm">{a.title}</h4>
                    <div className="flex gap-2">
                      <button onClick={() => toggleAnn(a.id, !!a.is_active)} className="text-xs text-slate-500 hover:text-slate-900">{a.is_active ? 'Gizle' : 'Göster'}</button>
                      <button onClick={() => deleteAnn(a.id)} className="text-xs text-red-500 hover:text-red-700">Sil</button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{a.content}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Sistem Logları (Audit)</h2>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {auditLogs.map(l => (
                <div key={l.id} className="text-xs pb-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <span className="text-slate-400">{new Date(l.created_at).toLocaleString("tr-TR")}</span>
                  <p className="font-medium text-slate-700 dark:text-slate-300 mt-0.5">{l.admin_email}</p>
                  <p className="text-slate-500">{l.action} <span className="text-primary">{l.target}</span></p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
