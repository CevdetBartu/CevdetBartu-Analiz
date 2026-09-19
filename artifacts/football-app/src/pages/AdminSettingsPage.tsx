import React, { useEffect, useState } from "react";
import AdminLayout from '../components/layout/AdminLayout';
import { fetchWithAuth } from "../lib/auth";
import { CheckCircle2, AlertCircle } from "lucide-react";

const BASE = import.meta.env.VITE_API_URL || "";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{type: "success" | "error", text: string} | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const res = await fetchWithAuth(`${BASE}/api/admin/settings`);
      if (res.ok) {
        const data = await res.json();
        const dict = data.reduce((acc: any, curr: any) => ({...acc, [curr.setting_key]: curr.setting_value}), {});
        // ensure default keys exist in state
        if (!dict.site_title) dict.site_title = "KargaTahmin";
        if (!dict.maintenance_mode) dict.maintenance_mode = "false";
        setSettings(dict);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    try {
      const res = await fetchWithAuth(`${BASE}/api/admin/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMsg({ type: "success", text: "Ayarlar başarıyla kaydedildi." });
      } else {
        setMsg({ type: "error", text: data.error || "Hata oluştu." });
      }
    } catch (e) {
      setMsg({ type: "error", text: "Bağlantı hatası." });
    }
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Site Ayarları</h1>
        <p className="text-slate-500 mt-1">Sitenin genel görünüm ve davranış ayarlarını buradan yönetin.</p>
      </div>

      {msg && (
        <div className={`mb-6 p-4 rounded-lg flex items-start gap-2 ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
          {msg.type === 'success' ? <CheckCircle2 size={20} className="mt-0.5 shrink-0" /> : <AlertCircle size={20} className="mt-0.5 shrink-0" />}
          {msg.text}
        </div>
      )}

      {loading ? (
        <div className="text-slate-500">Yükleniyor...</div>
      ) : (
        <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 max-w-2xl">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Site Başlığı</label>
              <input 
                type="text" 
                value={settings.site_title || ""} 
                onChange={e => setSettings({...settings, site_title: e.target.value})} 
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
              <p className="text-xs text-slate-500 mt-1">Tarayıcı sekmesinde ve bazı ana sayfa başlıklarında görünür.</p>
            </div>
            
            <div className="pt-4 border-t border-slate-100">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.maintenance_mode === "true"} 
                  onChange={e => setSettings({...settings, maintenance_mode: e.target.checked ? "true" : "false"})} 
                  className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="block text-sm font-bold text-slate-900">Bakım Modu</span>
                  <span className="block text-xs text-slate-500">Aktif edilirse, normal kullanıcılar siteye erişemez. (Henüz tam entegre değil, altyapı hazırlandı)</span>
                </div>
              </label>
            </div>

          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
              Ayarları Kaydet
            </button>
          </div>
        </form>
      )}
    </AdminLayout>
  );
}
