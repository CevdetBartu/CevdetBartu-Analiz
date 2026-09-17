import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { fetchWithAuth } from "../lib/auth";
import { Key, Plus, Trash2, CheckCircle2, AlertCircle } from "lucide-react";

const BASE = import.meta.env.VITE_API_URL || "";

export default function ApiManagementPage() {
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    loadKeys();
  }, []);

  async function loadKeys() {
    try {
      const res = await fetchWithAuth(`${BASE}/api/admin/api-keys`);
      if (res.ok) {
        setKeys(await res.json());
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    if (!newEmail) return;

    try {
      const res = await fetchWithAuth(`${BASE}/api/admin/api-keys`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(`Başarıyla oluşturuldu! Yeni Key: ${data.key}`);
        setNewEmail("");
        loadKeys();
      } else {
        setErrorMsg(data.error || "Bilinmeyen hata");
      }
    } catch(e: any) {
      setErrorMsg("Bağlantı hatası");
    }
  }

  async function handleRevoke(id: number) {
    if (!confirm("Bu anahtarı iptal etmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetchWithAuth(`${BASE}/api/admin/api-keys/${id}/revoke`, { method: "PUT" });
      if (res.ok) loadKeys();
    } catch (e) {}
  }

  if (loading) return <div className="p-8 text-center text-slate-500">Yükleniyor...</div>;

  return (
    <div className="p-4 max-w-6xl mx-auto font-sans">
      <Helmet><title>Admin - API Yönetimi</title></Helmet>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><Key className="text-blue-600" /> API Yönetimi (Beta)</h1>
          <p className="text-slate-500 mt-1">Geliştiriciler için manuel Beta API anahtarı üretin ve yönetin.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Yeni Key Uretme */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Plus size={18} className="text-emerald-500"/> Yeni API Key Üret
          </h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Kullanıcı E-Postası</label>
              <input 
                type="email" 
                value={newEmail} 
                onChange={e => setNewEmail(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" 
                placeholder="ornek@mail.com"
                required
              />
            </div>
            <button type="submit" className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors">
              Üret ve Ata
            </button>
            {errorMsg && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-start gap-2"><AlertCircle size={16} className="mt-0.5 shrink-0"/>{errorMsg}</div>}
            {successMsg && <div className="p-3 bg-emerald-50 text-emerald-700 text-sm font-mono break-all rounded-lg flex items-start gap-2"><CheckCircle2 size={16} className="mt-0.5 shrink-0"/>{successMsg}</div>}
          </form>
        </div>

        {/* Anahtar Listesi */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="p-4 font-semibold">Kullanıcı</th>
                <th className="p-4 font-semibold">API Key</th>
                <th className="p-4 font-semibold">Durum</th>
                <th className="p-4 font-semibold text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {keys.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-slate-500">Henüz üretilmiş API Key yok.</td></tr>
              ) : keys.map(k => (
                <tr key={k.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <div className="font-medium text-slate-900">{k.username || "İsimsiz"}</div>
                    <div className="text-slate-500 text-xs">{k.email}</div>
                  </td>
                  <td className="p-4 font-mono text-slate-600 bg-slate-50 rounded px-2">
                    {k.key_hint || "Eski Key (Gizli)"}
                  </td>
                  <td className="p-4">
                    {k.status === 'active' ? (
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">Aktif</span>
                    ) : (
                      <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">İptal Edildi</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    {k.status === 'active' && (
                      <button onClick={() => handleRevoke(k.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-flex items-center gap-1" title="Anahtarı İptal Et">
                        <Trash2 size={16} /> İptal
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
