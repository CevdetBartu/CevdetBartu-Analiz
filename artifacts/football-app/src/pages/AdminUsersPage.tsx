import React, { useEffect, useState } from "react";
import AdminLayout from '../components/layout/AdminLayout';
import { fetchWithAuth } from "../lib/auth";
import { Plus, Edit2, Trash2, CheckCircle2, AlertCircle } from "lucide-react";

const BASE = import.meta.env.VITE_API_URL || "";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{type: "success" | "error", text: string} | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "user",
    membership_plan: "free",
    vip_expires_at: "",
    is_banned: false
  });

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const res = await fetchWithAuth(`${BASE}/api/admin/users`);
      if (res.ok) setUsers(await res.json());
    } finally {
      setLoading(false);
    }
  }

  function openNewUserModal() {
    setEditingUser(null);
    setFormData({ email: "", password: "", role: "user", membership_plan: "free", vip_expires_at: "", is_banned: false });
    setIsModalOpen(true);
  }

  function openEditModal(user: any) {
    setEditingUser(user);
    setFormData({
      email: user.email,
      password: "", // leave blank unless changing
      role: user.role || "user",
      membership_plan: user.membership_plan || "free",
      vip_expires_at: user.vip_expires_at ? user.vip_expires_at.split('T')[0] : "", // simple date format for input type="date"
      is_banned: !!user.is_banned
    });
    setIsModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    try {
      const isEdit = !!editingUser;
      const url = isEdit ? `${BASE}/api/admin/users/${editingUser.id}` : `${BASE}/api/admin/users`;
      const method = isEdit ? "PUT" : "POST";
      
      const payload = { ...formData };
      if (isEdit && !payload.password) delete (payload as any).password;
      // Convert empty date to null
      if (!payload.vip_expires_at) (payload as any).vip_expires_at = null;

      const res = await fetchWithAuth(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setMsg({ type: "success", text: isEdit ? "Kullanıcı güncellendi." : "Kullanıcı oluşturuldu." });
        setIsModalOpen(false);
        loadUsers();
      } else {
        setMsg({ type: "error", text: data.error || "Hata oluştu." });
      }
    } catch(e) {
      setMsg({ type: "error", text: "Bağlantı hatası." });
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Kullanıcıyı silmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetchWithAuth(`${BASE}/api/admin/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMsg({ type: "success", text: "Kullanıcı silindi." });
        loadUsers();
      }
    } catch(e) {}
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Üye Yönetimi</h1>
        <button onClick={openNewUserModal} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          <Plus size={18} /> Yeni Üye
        </button>
      </div>

      {msg && (
        <div className={`mb-6 p-4 rounded-lg flex items-start gap-2 ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
          {msg.type === 'success' ? <CheckCircle2 size={20} className="mt-0.5 shrink-0" /> : <AlertCircle size={20} className="mt-0.5 shrink-0" />}
          {msg.text}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="p-4 font-semibold">ID & Email</th>
                <th className="p-4 font-semibold">Rol</th>
                <th className="p-4 font-semibold">Plan / VIP Bitiş</th>
                <th className="p-4 font-semibold">Kayıt Tarihi</th>
                <th className="p-4 font-semibold text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">Yükleniyor...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">Kullanıcı bulunamadı.</td></tr>
              ) : users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-slate-900">#{u.id}</div>
                    <div className="text-slate-600">{u.email}</div>
                    {u.is_banned ? <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full mt-1 inline-block">Yasaklı</span> : null}
                  </td>
                  <td className="p-4">
                    {u.role === 'admin' ? <span className="text-blue-600 font-semibold">Admin</span> : "Kullanıcı"}
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-slate-900">{u.membership_plan === 'vip' ? <span className="text-amber-600">VIP</span> : "Ücretsiz"}</div>
                    {u.vip_expires_at && <div className="text-slate-500 text-xs mt-1">{new Date(u.vip_expires_at).toLocaleDateString('tr-TR')}</div>}
                  </td>
                  <td className="p-4 text-slate-500">
                    {new Date(u.created_at).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => openEditModal(u)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors" title="Düzenle">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(u.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors" title="Sil">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-900 mb-6">{editingUser ? "Üye Düzenle" : "Yeni Üye Ekle"}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input type="email" required value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{editingUser ? "Şifre (Değiştirmek istemiyorsanız boş bırakın)" : "Şifre"}</label>
                <input type="password" required={!editingUser} value={formData.password} onChange={e=>setFormData({...formData, password: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Rol</label>
                  <select value={formData.role} onChange={e=>setFormData({...formData, role: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg bg-white">
                    <option value="user">Kullanıcı</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Plan</label>
                  <select value={formData.membership_plan} onChange={e=>setFormData({...formData, membership_plan: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg bg-white">
                    <option value="free">Ücretsiz</option>
                    <option value="vip">VIP</option>
                  </select>
                </div>
              </div>
              {formData.membership_plan === 'vip' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">VIP Bitiş Tarihi</label>
                  <input type="date" value={formData.vip_expires_at} onChange={e=>setFormData({...formData, vip_expires_at: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg" />
                </div>
              )}
              <label className="flex items-center gap-2 mt-4 cursor-pointer">
                <input type="checkbox" checked={formData.is_banned} onChange={e=>setFormData({...formData, is_banned: e.target.checked})} className="rounded text-blue-600 focus:ring-blue-500" />
                <span className="text-sm font-medium text-slate-700">Hesabı Yasakla (Ban)</span>
              </label>

              <div className="flex gap-3 pt-4 border-t border-slate-100 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors">İptal</button>
                <button type="submit" className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
