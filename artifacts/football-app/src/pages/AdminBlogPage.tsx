import React, { useEffect, useState } from "react";
import AdminLayout from '../components/layout/AdminLayout';
import { fetchWithAuth } from "../lib/auth";
import { Plus, Edit2, Trash2, CheckCircle2, AlertCircle, FileText } from "lucide-react";

const BASE = import.meta.env.VITE_API_URL || "";

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{type: "success" | "error", text: string} | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    category: "",
    excerpt: "",
    image_url: "",
    prediction: "",
    content: "" // HTML content
  });

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    try {
      const res = await fetchWithAuth(`${BASE}/api/blog`); // reuse public endpoint for listing
      if (res.ok) setPosts(await res.json());
    } finally {
      setLoading(false);
    }
  }

  function openNewModal() {
    setEditingPost(null);
    setFormData({ title: "", slug: "", category: "", excerpt: "", image_url: "", prediction: "", content: "" });
    setIsModalOpen(true);
  }

  function openEditModal(post: any) {
    setEditingPost(post);
    setFormData({
      title: post.title || "",
      slug: post.slug || "",
      category: post.category || "",
      excerpt: post.excerpt || "",
      image_url: post.image_url || "",
      prediction: post.prediction || "",
      content: post.content || ""
    });
    setIsModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    try {
      const isEdit = !!editingPost;
      const url = isEdit ? `${BASE}/api/admin/blog/${editingPost.id}` : `${BASE}/api/admin/blog/manual`;
      const method = isEdit ? "PUT" : "POST";
      
      const res = await fetchWithAuth(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setMsg({ type: "success", text: isEdit ? "Yazı güncellendi." : "Yazı oluşturuldu." });
        setIsModalOpen(false);
        loadPosts();
      } else {
        setMsg({ type: "error", text: data.error || "Hata oluştu." });
      }
    } catch(e) {
      setMsg({ type: "error", text: "Bağlantı hatası." });
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Bu yazıyı kalıcı olarak silmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetchWithAuth(`${BASE}/api/admin/blog/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMsg({ type: "success", text: "Yazı silindi." });
        loadPosts();
      }
    } catch(e) {}
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Blog Yönetimi</h1>
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
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="p-4 font-semibold">Başlık</th>
                <th className="p-4 font-semibold">Kategori</th>
                <th className="p-4 font-semibold">Tarih</th>
                <th className="p-4 font-semibold text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={4} className="p-8 text-center text-slate-500">Yükleniyor...</td></tr>
              ) : posts.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-slate-500">Blog yazısı bulunamadı.</td></tr>
              ) : posts.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-slate-900 truncate max-w-[300px]">{p.title}</div>
                    <div className="text-slate-500 text-xs mt-1">/{p.slug}</div>
                  </td>
                  <td className="p-4">
                    <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-xs font-medium">{p.category || 'Genel'}</span>
                  </td>
                  <td className="p-4 text-slate-500">
                    {new Date(p.created_at).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="p-4 text-right">
                    <a href={`/blog/${p.slug}`} target="_blank" rel="noreferrer" className="inline-block p-2 text-slate-400 hover:text-green-600 transition-colors" title="Görüntüle">
                      <FileText size={18} />
                    </a>
                    <button onClick={() => openEditModal(p)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors" title="Düzenle">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors" title="Sil">
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
          <div className="bg-white rounded-2xl w-full max-w-4xl p-6 shadow-xl max-h-[95vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">{editingPost ? "Yazıyı Düzenle" : "Yeni Yazı Ekle"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto pr-2 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Başlık</label>
                  <input type="text" required value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">URL (Slug)</label>
                  <input type="text" required value={formData.slug} onChange={e=>setFormData({...formData, slug: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg" />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
                  <input type="text" value={formData.category} onChange={e=>setFormData({...formData, category: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tahmin Sonucu (Örn: MS 1)</label>
                  <input type="text" value={formData.prediction} onChange={e=>setFormData({...formData, prediction: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Görsel URL</label>
                  <input type="text" value={formData.image_url} onChange={e=>setFormData({...formData, image_url: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Özet (Excerpt)</label>
                <textarea rows={2} value={formData.excerpt} onChange={e=>setFormData({...formData, excerpt: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg" />
              </div>
              
              <div className="flex-1 flex flex-col min-h-[300px]">
                <label className="block text-sm font-medium text-slate-700 mb-1">İçerik (HTML formatında)</label>
                <textarea required value={formData.content} onChange={e=>setFormData({...formData, content: e.target.value})} className="w-full flex-1 p-3 border border-slate-300 rounded-lg font-mono text-sm" placeholder="<p>Makale içeriği...</p>" />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100 mt-6 sticky bottom-0 bg-white pb-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors">İptal</button>
                <button type="submit" className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">Yazıyı Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
