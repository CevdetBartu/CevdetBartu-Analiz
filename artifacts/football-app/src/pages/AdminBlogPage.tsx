import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { fetchWithAuth } from "../lib/auth";
import { Edit, Trash, FileText, CheckCircle, AlertTriangle } from "lucide-react";

const BASE = import.meta.env.VITE_API_URL || "";

export default function AdminBlogPage() {
  const [drafts, setDrafts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [hallucinationWarning, setHallucinationWarning] = useState<string | null>(null);

  useEffect(() => {
    loadDrafts();
  }, []);

  useEffect(() => {
    if (editingPost && editingPost.raw_data) {
      checkHallucinations(editingPost.content, editingPost.raw_data);
    } else {
      setHallucinationWarning(null);
    }
  }, [editingPost?.content]);

  async function loadDrafts() {
    try {
      const res = await fetchWithAuth(`${BASE}/api/admin/blog/drafts`);
      if (res.ok) {
        const json = await res.json();
        setDrafts(json);
      }
    } finally {
      setLoading(false);
    }
  }

  function checkHallucinations(content: string, rawDataStr: string) {
    try {
      const rawData = JSON.parse(rawDataStr);
      // Metin içindeki tüm %X ve %X.X oranlarını bul (Örn: %75, %68.5)
      const percentagesInText = [...content.matchAll(/%(\d+(?:\.\d+)?)/g)].map(m => parseFloat(m[1]));
      
      if (percentagesInText.length === 0) {
        setHallucinationWarning(null);
        return;
      }

      // rawData içerisindeki tüm yuzde değerlerini topla
      const validPercentages = new Set<number>();
      rawData.forEach((match: any) => {
        if (!match.stats) return;
        ['ev_sahibi', 'beraberlik', 'deplasman', 'ust_25', 'kg_var'].forEach(key => {
          if (match.stats[key]?.yuzde) {
            // Yüzdeleri yuvarlayarak set'e ekle (AI bazen yuvarlar)
            const val = parseFloat(match.stats[key].yuzde);
            validPercentages.add(Math.round(val));
            validPercentages.add(Math.floor(val));
            validPercentages.add(Math.ceil(val));
            validPercentages.add(100 - Math.round(val)); // Ters ihtimaller (ALT, YOK)
          }
        });
      });

      // Metindeki yüzdelerden en az biri geçerli yüzdeler içinde yoksa uyar
      const suspiciousNumbers = percentagesInText.filter(p => !validPercentages.has(Math.round(p)));
      
      if (suspiciousNumbers.length > 0) {
        setHallucinationWarning(`Dikkat: Metindeki bazı oranlar (%${suspiciousNumbers.join(', %')}) orijinal veriyle eşleşmiyor olabilir. Lütfen taslağı manuel kontrol edin.`);
      } else {
        setHallucinationWarning(null);
      }

    } catch(e) {
      console.error("Hallucination check failed", e);
    }
  }

  async function handleSave(status: "draft" | "published") {
    if (!editingPost) return;
    try {
      const res = await fetchWithAuth(`${BASE}/api/admin/blog/posts/${editingPost.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editingPost, status })
      });
      if (res.ok) {
        alert("Başarıyla kaydedildi!");
        setEditingPost(null);
        loadDrafts();
      }
    } catch(e) {}
  }

  async function handleDelete(id: number) {
    if(!confirm("Emin misiniz?")) return;
    try {
      const res = await fetchWithAuth(`${BASE}/api/admin/blog/posts/${id}`, { method: "DELETE" });
      if(res.ok) loadDrafts();
    } catch(e) {}
  }

  if (loading) return <div>Yükleniyor...</div>;

  if (editingPost) {
    return (
      <div className="p-4 space-y-4 max-w-5xl mx-auto">
        <h2 className="text-xl font-bold">Blog Düzenle</h2>
        
        {hallucinationWarning && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-3">
            <AlertTriangle className="shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-bold">Yapay Zeka Halüsinasyon Riski!</p>
              <p className="text-sm">{hallucinationWarning}</p>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium">Başlık (SEO uyumlu)</label>
          <input className="w-full p-2 border rounded" value={editingPost.title} onChange={e => setEditingPost({...editingPost, title: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-medium">URL Slug</label>
          <input className="w-full p-2 border rounded" value={editingPost.slug} onChange={e => setEditingPost({...editingPost, slug: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-medium">Kısa Açıklama (Meta)</label>
          <input className="w-full p-2 border rounded" value={editingPost.meta_description || ''} onChange={e => setEditingPost({...editingPost, meta_description: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-medium">İçerik (HTML veya Markdown)</label>
          <textarea rows={20} className="w-full p-2 border rounded font-mono text-sm leading-relaxed bg-slate-50" value={editingPost.content} onChange={e => setEditingPost({...editingPost, content: e.target.value})} />
        </div>
        <div className="flex gap-2">
          <button onClick={() => setEditingPost(null)} className="px-4 py-2 bg-slate-200 rounded font-semibold">İptal</button>
          <button onClick={() => handleSave('draft')} className="px-4 py-2 bg-blue-500 text-white rounded font-semibold">Taslak Olarak Kaydet</button>
          <button onClick={() => handleSave('published')} className="px-4 py-2 bg-emerald-500 text-white rounded font-bold">Yayınla!</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <Helmet><title>Admin - Blog Taslakları</title></Helmet>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Blog Taslakları & İçerik Yönetimi</h1>
      </div>

      <div className="bg-white rounded-xl shadow border overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 border-b">
            <tr>
              <th className="p-4">Başlık</th>
              <th className="p-4">Durum</th>
              <th className="p-4">Tarih</th>
              <th className="p-4 text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {drafts.length === 0 ? (
              <tr><td colSpan={4} className="p-4 text-center text-slate-400">Henüz taslak yok.</td></tr>
            ) : drafts.map(d => (
              <tr key={d.id} className="border-b last:border-0 hover:bg-slate-50">
                <td className="p-4 font-medium text-slate-700">{d.title}</td>
                <td className="p-4">
                  {d.status === 'published' ? (
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-bold flex items-center gap-1 w-max"><CheckCircle size={14}/> Yayında</span>
                  ) : (
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-bold flex items-center gap-1 w-max"><FileText size={14}/> Taslak</span>
                  )}
                </td>
                <td className="p-4 text-slate-500">{new Date(d.created_at).toLocaleDateString('tr-TR')}</td>
                <td className="p-4 flex gap-2 justify-end">
                  <button onClick={() => setEditingPost(d)} className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"><Edit size={16} /></button>
                  <button onClick={() => handleDelete(d.id)} className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"><Trash size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
