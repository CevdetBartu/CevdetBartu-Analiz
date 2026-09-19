import React, { useEffect, useState } from "react";
import AdminLayout from '../components/layout/AdminLayout';
import RichTextEditor from '../components/RichTextEditor';
import { fetchWithAuth } from "../lib/auth";
import { Plus, Edit2, Trash2, CheckCircle2, AlertCircle, FileText, Eye, RefreshCw } from "lucide-react";

const BASE = import.meta.env.VITE_API_URL || "";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s]+/g, '-');
}

// Extract first image from HTML content
function extractFirstImage(html: string): string {
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match ? match[1] : '';
}

// Generate excerpt from HTML
function extractExcerpt(html: string, length = 160): string {
  const stripped = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return stripped.length > length ? stripped.substring(0, length) + '...' : stripped;
}

// Estimate read time
function calcReadTime(html: string): string {
  const words = html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  const mins = Math.max(1, Math.ceil(words / 200));
  return `${mins} dk okuma`;
}

const CATEGORIES = ['Tahmin Analizi', 'Lig Haberleri', 'İstatistik', 'Strateji', 'Genel'];

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{type: "success" | "error", text: string} | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    category: "",
    excerpt: "",
    image_url: "",
    prediction: "",
    content: "",
    // SEO fields
    seo_title: "",
    seo_description: "",
    seo_keywords: "",
    canonical_url: "",
    og_image: "",
    noindex: false,
  });

  useEffect(() => { loadPosts(); }, []);

  async function loadPosts() {
    try {
      const res = await fetchWithAuth(`${BASE}/api/blog`);
      if (res.ok) setPosts(await res.json());
    } finally { setLoading(false); }
  }

  function openNewModal() {
    setEditingPost(null);
    setFormData({ title: "", slug: "", category: "", excerpt: "", image_url: "", prediction: "", content: "", seo_title: "", seo_description: "", seo_keywords: "", canonical_url: "", og_image: "", noindex: false });
    setIsModalOpen(true);
  }

  function openEditModal(post: any) {
    setEditingPost(post);
    setFormData({
      title: post.title || "", slug: post.slug || "", category: post.category || "",
      excerpt: post.excerpt || "", image_url: post.image_url || "", prediction: post.prediction || "",
      content: post.content || "",
      seo_title: post.seo_title || "", seo_description: post.seo_description || "",
      seo_keywords: post.seo_keywords || "", canonical_url: post.canonical_url || "",
      og_image: post.og_image || "", noindex: !!post.noindex,
    });
    setIsModalOpen(true);
  }

  function handleTitleChange(title: string) {
    const newSlug = editingPost ? formData.slug : slugify(title);
    const newSeoTitle = title ? `${title} | KargaTahmin` : '';
    setFormData(f => ({ ...f, title, slug: newSlug, seo_title: f.seo_title || newSeoTitle }));
  }

  function handleContentChange(html: string) {
    const autoImage = extractFirstImage(html);
    const autoExcerpt = extractExcerpt(html);
    setFormData(f => ({
      ...f,
      content: html,
      image_url: f.image_url || autoImage,
      og_image: f.og_image || autoImage,
      excerpt: f.excerpt || autoExcerpt,
      seo_description: f.seo_description || autoExcerpt,
    }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    // Auto-fill remaining SEO fields
    const payload = {
      ...formData,
      read_time: calcReadTime(formData.content),
      seo_title: formData.seo_title || `${formData.title} | KargaTahmin`,
      seo_description: formData.seo_description || extractExcerpt(formData.content),
    };

    try {
      const isEdit = !!editingPost;
      const url = isEdit ? `${BASE}/api/admin/blog/${editingPost.id}` : `${BASE}/api/admin/blog/manual`;
      const method = isEdit ? "PUT" : "POST";
      const res = await fetchWithAuth(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (res.ok && data.success) {
        setMsg({ type: "success", text: isEdit ? "Yazı güncellendi." : "Yazı yayınlandı." });
        setIsModalOpen(false);
        loadPosts();
      } else {
        setMsg({ type: "error", text: data.error || "Hata oluştu." });
      }
    } catch { setMsg({ type: "error", text: "Bağlantı hatası." }); }
  }

  async function handleDelete(id: number) {
    if (!confirm("Bu yazıyı kalıcı olarak silmek istediğinize emin misiniz?")) return;
    const res = await fetchWithAuth(`${BASE}/api/admin/blog/${id}`, { method: "DELETE" });
    if (res.ok) { setMsg({ type: "success", text: "Yazı silindi." }); loadPosts(); }
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Blog Yönetimi</h1>
          <p className="text-slate-500 mt-1">{posts.length} yazı yayında</p>
        </div>
        <button onClick={openNewModal} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          <Plus size={18} /> Yeni Yazı Ekle
        </button>
      </div>

      {msg && (
        <div className={`mb-6 p-4 rounded-lg flex items-start gap-2 ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
          {msg.type === 'success' ? <CheckCircle2 size={20} className="mt-0.5 shrink-0" /> : <AlertCircle size={20} className="mt-0.5 shrink-0" />}
          {msg.text}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
            <tr>
              <th className="p-4 font-semibold">Başlık & Slug</th>
              <th className="p-4 font-semibold">Kategori</th>
              <th className="p-4 font-semibold">SEO Başlığı</th>
              <th className="p-4 font-semibold">Tarih</th>
              <th className="p-4 font-semibold text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={5} className="p-8 text-center text-slate-500">Yükleniyor...</td></tr>
            ) : posts.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-slate-500">Henüz yazı yok. İlk yazıyı ekleyin!</td></tr>
            ) : posts.map(p => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {p.image_url && <img src={p.image_url} alt="" className="w-10 h-10 rounded-lg object-cover bg-slate-100" onError={e=>(e.currentTarget.style.display='none')} />}
                    <div>
                      <div className="font-bold text-slate-900 max-w-[260px] truncate">{p.title}</div>
                      <div className="text-slate-400 text-xs mt-0.5">/{p.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4"><span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-xs font-medium">{p.category || 'Genel'}</span></td>
                <td className="p-4 text-slate-500 text-xs max-w-[200px] truncate">{p.seo_title || p.title}</td>
                <td className="p-4 text-slate-500 whitespace-nowrap">{new Date(p.created_at).toLocaleDateString('tr-TR')}</td>
                <td className="p-4 text-right whitespace-nowrap">
                  <a href={`/blog/${p.slug}`} target="_blank" rel="noreferrer" className="inline-block p-2 text-slate-400 hover:text-emerald-600 transition-colors" title="Görüntüle"><Eye size={16} /></a>
                  <button onClick={() => openEditModal(p)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors" title="Düzenle"><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(p.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors" title="Sil"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/60 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-5xl my-8 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">{editingPost ? "Yazıyı Düzenle" : "Yeni Yazı Ekle"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-6">
              {/* === Temel Bilgiler === */}
              <div>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Temel Bilgiler</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Başlık *</label>
                    <input type="text" required value={formData.title} onChange={e=>handleTitleChange(e.target.value)} className="w-full p-3 border border-slate-300 rounded-lg text-lg font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="Makale başlığı..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">URL Slug *</label>
                    <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                      <span className="px-3 py-2.5 bg-slate-50 text-slate-500 text-sm border-r border-slate-300">/blog/</span>
                      <input type="text" required value={formData.slug} onChange={e=>setFormData(f=>({...f, slug: e.target.value}))} className="flex-1 p-2.5 text-sm outline-none" />
                      <button type="button" onClick={()=>setFormData(f=>({...f, slug: slugify(f.title)}))} className="px-3 py-2.5 text-slate-400 hover:text-blue-600" title="Başlıktan otomatik oluştur"><RefreshCw size={14}/></button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
                    <select value={formData.category} onChange={e=>setFormData(f=>({...f, category: e.target.value}))} className="w-full p-2.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                      <option value="">Kategori seçin...</option>
                      {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tahmin Sonucu</label>
                    <input type="text" value={formData.prediction} onChange={e=>setFormData(f=>({...f, prediction: e.target.value}))} placeholder="Örn: MS 1, Alt 2.5" className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Kapak Görseli URL <span className="text-slate-400 font-normal">(İçerikten otomatik algılanır)</span></label>
                    <input type="url" value={formData.image_url} onChange={e=>setFormData(f=>({...f, image_url: e.target.value}))} placeholder="https://..." className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    {formData.image_url && <img src={formData.image_url} alt="preview" className="mt-2 h-20 rounded-lg object-cover" onError={e=>(e.currentTarget.style.display='none')} />}
                  </div>
                </div>
              </div>

              {/* === İçerik === */}
              <div>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">İçerik (Zengin Metin Editörü)</h3>
                <RichTextEditor content={formData.content} onChange={handleContentChange} placeholder="Makale içeriğinizi buraya yazın. Görseller içeriğe eklendikçe kapak görseli otomatik algılanır." />
              </div>

              {/* === SEO === */}
              <div className="bg-slate-50 rounded-xl p-5">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs">SEO</span>
                  Arama Motoru Optimizasyonu
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">SEO Başlığı <span className="text-slate-400">(70 karakter önerilir)</span></label>
                    <input type="text" value={formData.seo_title} onChange={e=>setFormData(f=>({...f, seo_title: e.target.value}))} placeholder="Makalenin SEO başlığı..." className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    <div className={`text-xs mt-1 ${formData.seo_title.length > 70 ? 'text-red-500' : 'text-slate-400'}`}>{formData.seo_title.length}/70</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Meta Açıklaması <span className="text-slate-400">(160 karakter önerilir — Özetten otomatik doldurulur)</span></label>
                    <textarea rows={2} value={formData.seo_description} onChange={e=>setFormData(f=>({...f, seo_description: e.target.value}))} placeholder="Google arama sonuçlarında görünecek açıklama..." className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
                    <div className={`text-xs mt-1 ${formData.seo_description.length > 160 ? 'text-red-500' : 'text-slate-400'}`}>{formData.seo_description.length}/160</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Anahtar Kelimeler</label>
                      <input type="text" value={formData.seo_keywords} onChange={e=>setFormData(f=>({...f, seo_keywords: e.target.value}))} placeholder="futbol, tahmin, maç analizi" className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">OG Görseli (Sosyal Medya)</label>
                      <input type="url" value={formData.og_image} onChange={e=>setFormData(f=>({...f, og_image: e.target.value}))} placeholder="https://..." className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.noindex} onChange={e=>setFormData(f=>({...f, noindex: e.target.checked}))} className="rounded text-blue-600" />
                    <span className="text-sm font-medium text-slate-700">Bu sayfayı arama motorlarından gizle (noindex)</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors">İptal</button>
                <button type="submit" className="flex-2 flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
                  {editingPost ? "Yazıyı Güncelle" : "Yazıyı Yayınla"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
