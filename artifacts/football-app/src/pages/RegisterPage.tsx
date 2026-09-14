import React, { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { Helmet } from 'react-helmet-async';
import './Auth.css';

const BASE = import.meta.env.VITE_API_URL || "";

export default function RegisterPage() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [kvkk, setKvkk] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor.");
      return;
    }

    if (password.length < 8) {
      setError("Şifre en az 8 karakter olmalıdır.");
      return;
    }

    if (!kvkk) {
      setError("Kayıt olmak için gizlilik politikasını kabul etmelisiniz.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, kvkk })
      });
      const data = await res.json();
      
      if (data.success) {
        // Basarili kayit sonrasi logine yonlendir
        alert("Kayıt başarılı! Lütfen giriş yapın.");
        setLocation('/giris');
      } else {
        setError(data.error || "Bilinmeyen bir hata oluştu.");
      }
    } catch (err: any) {
      setError("Sunucuya bağlanılamadı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <Helmet>
        <title>Kayıt Ol - KargaTahmin</title>
      </Helmet>
      <div className="auth-card">
        <h2>Ücretsiz Kayıt Ol</h2>
        <p className="auth-subtitle">Yapay zeka destekli iddaa analizlerine hemen erişin.</p>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>E-posta Adresi</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
              placeholder="E-posta adresiniz"
            />
          </div>
          
          <div className="form-group">
            <label>Şifre</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              minLength={8}
              placeholder="En az 8 karakter"
            />
          </div>

          <div className="form-group">
            <label>Şifre Tekrarı</label>
            <input 
              type="password" 
              value={confirmPassword} 
              onChange={e => setConfirmPassword(e.target.value)} 
              required 
              minLength={8}
              placeholder="Şifrenizi tekrar girin"
            />
          </div>

          <div className="form-group checkbox-group">
            <input 
              type="checkbox" 
              id="kvkk" 
              checked={kvkk} 
              onChange={e => setKvkk(e.target.checked)} 
            />
            <label htmlFor="kvkk">
              Kayıt olarak <a href="#" target="_blank">Gizlilik Politikası ve Kullanım Şartları</a>'nı okuduğumu ve kabul ettiğimi onaylıyorum.
            </label>
          </div>
          
          <button type="submit" disabled={loading} className="auth-submit-btn">
            {loading ? "Kaydediliyor..." : "Hesap Oluştur"}
          </button>
        </form>

        <div className="auth-footer">
          Zaten hesabınız var mı? <Link href="/giris">Giriş Yap</Link>
        </div>
      </div>
    </div>
  );
}
