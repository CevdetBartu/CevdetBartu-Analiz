import React, { useEffect, useState } from "react";
import AdminLayout from '../components/layout/AdminLayout';
import { fetchWithAuth } from "../lib/auth";
import { CheckCircle2, AlertCircle, Globe, BarChart2, Mail, Share2, Search, Wrench, FileCode } from "lucide-react";

const BASE = import.meta.env.VITE_API_URL || "";

const SETTING_GROUPS = [
  {
    id: 'seo', label: 'SEO & Arama Motoru', icon: Search,
    description: 'Sitenin Google ve Bing gibi arama motorlarındaki görünürlüğünü yönetin.',
    settings: [
      { key: 'site_title', label: 'Site Başlığı', type: 'text', placeholder: 'KargaTahmin', help: 'Tarayıcı sekmesinde ve sitelerin başlığında görünür.' },
      { key: 'meta_title', label: 'Varsayılan Meta Başlığı', type: 'text', placeholder: 'KargaTahmin - Yapay Zeka Destekli Maç Tahminleri', help: 'Sayfa başına özel başlık yoksa bu kullanılır (70 karakter).' },
      { key: 'meta_description', label: 'Varsayılan Meta Açıklaması', type: 'textarea', placeholder: 'Yapay zeka ile analiz edilmiş futbol tahminleri...', help: 'Google arama sonuçlarında görünen açıklama (160 karakter).' },
      { key: 'canonical_domain', label: 'Canonical Domain', type: 'text', placeholder: 'https://kargatahmin.com', help: 'Kanonik URL prefix\'i. www/non-www tutarlılığını sağlar.' },
      { key: 'og_image', label: 'Varsayılan OG Görseli URL', type: 'text', placeholder: 'https://kargatahmin.com/og-image.jpg', help: 'Sosyal medyada paylaşımlarda görünen varsayılan görsel.' },
    ]
  },
  {
    id: 'analytics', label: 'Analitik & Takip', icon: BarChart2,
    description: 'Ziyaretçi takibi ve dönüşüm ölçümü için üçüncü parti entegrasyonlar.',
    settings: [
      { key: 'google_analytics_id', label: 'Google Analytics 4 Ölçüm ID', type: 'text', placeholder: 'G-XXXXXXXXXX', help: 'Google Analytics 4 Measurement ID. Boş bırakılırsa GA devre dışı.' },
      { key: 'google_tag_manager_id', label: 'Google Tag Manager ID', type: 'text', placeholder: 'GTM-XXXXXXX', help: 'Google Tag Manager container ID.' },
      { key: 'facebook_pixel_id', label: 'Facebook Pixel ID', type: 'text', placeholder: '123456789012345', help: 'Meta reklam dönüşüm takibi için Pixel ID.' },
    ]
  },
  {
    id: 'social', label: 'Sosyal Medya', icon: Share2,
    description: 'Sosyal medya hesapları ve paylaşım ayarları.',
    settings: [
      { key: 'twitter_handle', label: 'Twitter / X Kullanıcı Adı', type: 'text', placeholder: '@kargatahmin', help: 'Twitter Card meta etiketlerinde kullanılır.' },
      { key: 'instagram_url', label: 'Instagram Profil URL', type: 'text', placeholder: 'https://instagram.com/kargatahmin', help: '' },
      { key: 'youtube_url', label: 'YouTube Kanal URL', type: 'text', placeholder: 'https://youtube.com/@kargatahmin', help: '' },
    ]
  },
  {
    id: 'contact', label: 'İletişim & Marka', icon: Mail,
    description: 'İletişim bilgileri ve marka ayarları.',
    settings: [
      { key: 'contact_email', label: 'İletişim E-postası', type: 'text', placeholder: 'iletisim@kargatahmin.com', help: 'İletişim formlarında kullanılan e-posta adresi.' },
      { key: 'footer_text', label: 'Footer Telif Hakkı Metni', type: 'text', placeholder: 'KargaTahmin - Tüm hakları saklıdır.', help: '' },
      { key: 'disclaimer_text', label: 'Yasal Uyarı Metni', type: 'textarea', placeholder: 'Bu site sadece bilgilendirme amaçlı...', help: 'Blog yazılarının altında ve sitenin çeşitli yerlerinde görünür.' },
    ]
  },
  {
    id: 'technical', label: 'Teknik Ayarlar', icon: Wrench,
    description: 'Bakım modu, robots.txt ve teknik yapılandırmalar.',
    settings: [
      { key: 'maintenance_mode', label: 'Bakım Modu', type: 'toggle', help: 'Aktif edilirse normal kullanıcılar siteye erişemez.' },
      { key: 'robots_txt', label: 'robots.txt İçeriği', type: 'textarea', placeholder: 'User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: https://kargatahmin.com/sitemap.xml', help: 'Arama motorları için tarama kuralları. Boş bırakılırsa varsayılan kullanılır.' },
      { key: 'custom_head_scripts', label: 'Özel `<head>` Scriptleri', type: 'textarea', placeholder: '<!-- Buraya ek script ve meta tagları ekleyin -->', help: 'Tüm sayfalara eklenmesini istediğiniz HTML (Hotjar, Tawk, vs.).' },
    ]
  },
];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{type: "success" | "error", text: string} | null>(null);
  const [activeGroup, setActiveGroup] = useState('seo');

  useEffect(() => { loadSettings(); }, []);

  async function loadSettings() {
    try {
      const res = await fetchWithAuth(`${BASE}/api/admin/settings`);
      if (res.ok) {
        const data = await res.json();
        const dict = data.reduce((acc: any, curr: any) => ({ ...acc, [curr.setting_key]: curr.setting_value }), {});
        setSettings(dict);
      }
    } finally { setLoading(false); }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetchWithAuth(`${BASE}/api/admin/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMsg({ type: "success", text: "Ayarlar başarıyla kaydedildi!" });
      } else {
        setMsg({ type: "error", text: data.error || "Hata oluştu." });
      }
    } catch { setMsg({ type: "error", text: "Bağlantı hatası." }); }
    finally { setSaving(false); }
  }

  const currentGroup = SETTING_GROUPS.find(g => g.id === activeGroup)!;

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Site Ayarları</h1>
        <p className="text-slate-500 mt-1">SEO, analitik, sosyal medya ve teknik yapılandırmalar.</p>
      </div>

      {msg && (
        <div className={`mb-6 p-4 rounded-lg flex items-start gap-2 ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
          {msg.type === 'success' ? <CheckCircle2 size={20} className="mt-0.5 shrink-0" /> : <AlertCircle size={20} className="mt-0.5 shrink-0" />}
          {msg.text}
        </div>
      )}

      {loading ? <div className="text-slate-500">Yükleniyor...</div> : (
        <form onSubmit={handleSave} className="flex gap-6">
          {/* Sidebar */}
          <div className="w-52 shrink-0">
            <nav className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              {SETTING_GROUPS.map(g => {
                const Icon = g.icon;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setActiveGroup(g.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium transition-colors border-b border-slate-100 last:border-0 ${activeGroup === g.id ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    <Icon size={16} /> {g.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-900">{currentGroup.label}</h2>
                <p className="text-sm text-slate-500 mt-1">{currentGroup.description}</p>
              </div>

              <div className="space-y-5">
                {currentGroup.settings.map(setting => (
                  <div key={setting.key}>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{setting.label}</label>

                    {setting.type === 'toggle' ? (
                      <label className="flex items-center gap-3 cursor-pointer">
                        <div
                          onClick={() => setSettings(s => ({ ...s, [setting.key]: s[setting.key] === 'true' ? 'false' : 'true' }))}
                          className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer ${settings[setting.key] === 'true' ? 'bg-blue-600' : 'bg-slate-300'}`}
                        >
                          <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings[setting.key] === 'true' ? 'translate-x-6' : 'translate-x-0.5'}`} />
                        </div>
                        <span className="text-sm text-slate-600">{settings[setting.key] === 'true' ? 'Aktif' : 'Pasif'}</span>
                      </label>
                    ) : setting.type === 'textarea' ? (
                      <textarea
                        rows={4}
                        value={settings[setting.key] || ''}
                        onChange={e => setSettings(s => ({ ...s, [setting.key]: e.target.value }))}
                        placeholder={setting.placeholder}
                        className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none font-mono"
                      />
                    ) : (
                      <input
                        type="text"
                        value={settings[setting.key] || ''}
                        onChange={e => setSettings(s => ({ ...s, [setting.key]: e.target.value }))}
                        placeholder={setting.placeholder}
                        className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    )}

                    {setting.help && <p className="text-xs text-slate-400 mt-1">{setting.help}</p>}
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                <button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors">
                  {saving ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}
    </AdminLayout>
  );
}
