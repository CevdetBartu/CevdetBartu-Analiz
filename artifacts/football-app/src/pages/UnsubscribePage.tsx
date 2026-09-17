import React, { useEffect, useState } from 'react';
import { useRoute, Link } from "wouter";
import { Helmet } from 'react-helmet-async';
import { CheckCircle, XCircle } from 'lucide-react';

const BASE = import.meta.env.VITE_API_URL || "";

export default function UnsubscribePage() {
  const [, params] = useRoute("/unsubscribe/:hash");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (params?.hash) {
      fetch(`${BASE}/api/unsubscribe/${params.hash}`)
        .then(r => r.json())
        .then(data => {
          if (data.success) {
            setStatus("success");
            setMessage("Bülten aboneliğiniz başarıyla iptal edildi. Artık haftalık e-posta almayacaksınız.");
          } else {
            setStatus("error");
            setMessage(data.error || "Bilinmeyen bir hata oluştu.");
          }
        })
        .catch(() => {
          setStatus("error");
          setMessage("Bağlantı hatası.");
        });
    } else {
      setStatus("error");
      setMessage("Geçersiz link.");
    }
  }, [params?.hash]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Helmet><title>Abonelikten Çık - KargaTahmin</title></Helmet>
      
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
        {status === "loading" && (
          <div className="text-slate-500 font-medium">İşleminiz gerçekleştiriliyor...</div>
        )}
        
        {status === "success" && (
          <div>
            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Başarıyla Çıkış Yapıldı</h1>
            <p className="text-slate-600 mb-8">{message}</p>
            <Link href="/" className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors">
              Anasayfaya Dön
            </Link>
          </div>
        )}

        {status === "error" && (
          <div>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-800 mb-2">İşlem Başarısız</h1>
            <p className="text-slate-600 mb-8">{message}</p>
            <Link href="/" className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors">
              Anasayfaya Dön
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
