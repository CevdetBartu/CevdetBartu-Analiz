import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'wouter';

export default function PrivacyPolicy() {
  return (
    <div className="app-container" style={{ minHeight: '100vh', backgroundColor: '#0f172a', padding: '40px 20px', color: '#e2e8f0' }}>
      <Helmet>
        <title>Gizlilik Politikası - KargaTahmin</title>
      </Helmet>
      
      <div style={{ maxWidth: '800px', margin: '0 auto', background: '#1e293b', padding: '40px', borderRadius: '12px' }}>
        <Link href="/" style={{ color: '#38bdf8', textDecoration: 'none', marginBottom: '20px', display: 'inline-block' }}>
          &larr; Ana Sayfaya Dön
        </Link>
        
        <h1 style={{ fontSize: '2rem', marginBottom: '20px', color: '#fff' }}>Gizlilik Politikası ve Kullanım Şartları</h1>
        
        <div style={{ lineHeight: '1.6' }}>
          <h2>1. Verilerin Toplanması</h2>
          <p>Sistemimize kayıt olduğunuzda sadece e-posta adresiniz ve şifreniz (kriptolanmış olarak) saklanır. Şifreleriniz kesinlikle düz metin olarak veritabanında tutulmaz ve üçüncü şahıslarla paylaşılmaz.</p>
          
          <h2>2. Verilerin Kullanımı</h2>
          <p>E-posta adresiniz yalnızca sistemimize giriş yapabilmeniz ve nadiren önemli güncellemeler hakkında sizi bilgilendirmek amacıyla kullanılır. Spam veya promosyon e-postaları gönderilmez.</p>
          
          <h2>3. Çerezler (Cookies)</h2>
          <p>Oturumunuzu açık tutmak ve güvenliğinizi sağlamak amacıyla teknik olarak zorunlu çerezler (localStorage / token) kullanılmaktadır. Reklam veya izleme çerezleri kullanılmaz.</p>
          
          <h2>4. İddaa ve Bahis Sorumluluğu</h2>
          <p>KargaTahmin tarafından sunulan yapay zeka analizleri kesinlikle <strong>yatırım tavsiyesi değildir</strong>. Sunulan analizler istatistiksel verilere dayanır ve %100 doğruluk garantisi vermez. Doğabilecek her türlü maddi ve manevi zarardan kullanıcı sorumludur.</p>

          <h2>5. Hesap Silme</h2>
          <p>Hesabınızı ve size ait tüm verileri kalıcı olarak silmek isterseniz bizimle iletişime geçebilirsiniz.</p>
        </div>
      </div>
    </div>
  );
}