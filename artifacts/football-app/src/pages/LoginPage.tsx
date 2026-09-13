import React, { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { Helmet } from 'react-helmet-async';
import { setToken, setUserEmail } from '../lib/auth';
import './Auth.css';

const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (data.success) {
        setToken(data.token);
        setUserEmail(data.email || email);
        setLocation('/');
      } else {
        setError(data.error || "Giriş başarısız.");
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
        <title>Giriş Yap - KargaTahmin</title>
      </Helmet>
      <div className="auth-card">
        <h2>Giriş Yap</h2>
        <p className="auth-subtitle">Hesabınıza giriş yaparak analizlere ulaşın.</p>
        
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
              placeholder="Şifreniz"
            />
          </div>
          
          <button type="submit" disabled={loading} className="auth-submit-btn">
            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </form>

        <div className="auth-footer">
          Hesabınız yok mu? <Link href="/kayit">Ücretsiz Kayıt Ol</Link>
        </div>
      </div>
    </div>
  );
}