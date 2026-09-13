# Web Sunucusu (VDS/VPS) Kurulum Rehberi

Bu klasör, projenizin web sunucusuna (hosting/VDS/VPS) yüklenmeye hazır, derlenmiş (build edilmiş) dosyalarını içerir. 

## Klasör Yapısı

*   **`frontend/`**: React uygulamanızın derlenmiş statik dosyaları (HTML, CSS, JS). Bu dosyalar doğrudan bir web sunucusu (Nginx, Apache vb.) tarafından yayınlanabilir veya cPanel'deki `public_html` içine atılabilir.
*   **`backend/`**: Node.js API sunucunuzun derlenmiş (esbuild) dosyalarıdır. `dist` klasörü ve `package.json` içerir. Sunucuda çalıştırılması gerekir (örn. PM2 ile).
*   **`scraper/`**: Python veri çekme botunuzdur. Sunucuda Python sanal ortamında (venv) arka planda çalıştırılmalıdır.
*   **`*.db` / `*.sqlite`**: Veritabanı dosyalarınızdır.

---

## Sunucu (VPS/VDS) Kurulum Adımları (Ubuntu/Linux)

Web sitenizi yayınlamak için genellikle bir VDS (Sanal Sunucu) önerilir (Örn. Hetzner, DigitalOcean, Vultr vb.). Sadece paylaşımlı cPanel hostinginiz varsa, Node.js ve Python desteklemiyorsa bu sistemi tam anlamıyla çalıştıramazsınız.

### 1. Ön Gereksinimler
Sunucunuza SSH ile bağlanın ve Node.js ile Python'u kurun:
```bash
sudo apt update
sudo apt install -y nodejs npm python3 python3-venv python3-pip nginx
sudo npm install -g pm2
```

### 2. Dosyaları Sunucuya Yükleme
Bu klasördeki (`Web_Sunucu_Dosyalari`) tüm dosyaları FileZilla veya SCP ile sunucunuzdaki bir dizine (örn. `/var/www/futbol_app`) yükleyin.

### 3. API Sunucusunu (Backend) Başlatma
```bash
cd /var/www/futbol_app/backend
# Gerekli bağımlılıkları yükleyin (sadece production için)
npm install --omit=dev
# API sunucusunu PM2 ile arka planda başlatın
pm2 start dist/index.mjs --name "api-server"
```

### 4. Scraper Botunu (Python) Başlatma
```bash
cd /var/www/futbol_app/scraper
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
# Scraper'ı da arka planda başlatmak için PM2 veya nohup kullanabilirsiniz
pm2 start run.py --interpreter python3 --name "scraper-bot"
```

### 5. Frontend (React) Yayınlama (Nginx ile)
Frontend dosyalarını `/var/www/html` veya benzeri bir dizine taşıyıp Nginx ile servis edebilirsiniz.
```bash
sudo cp -r /var/www/futbol_app/frontend/* /var/www/html/
```

Daha sonra Nginx ayarlarından `/api` isteklerini Node.js sunucusuna (localhost:8080) yönlendirmeniz (Reverse Proxy) gerekir. Örnek bir Nginx yapılandırması:

```nginx
server {
    listen 80;
    server_name www.siteniz.com siteniz.com;

    root /var/www/html;
    index index.html;

    # React yönlendirmeleri için (React Router kullanılıyorsa)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API istekleri için yönlendirme
    location /api/ {
        proxy_pass http://localhost:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Nginx'i yeniden başlatın:
```bash
sudo systemctl restart nginx
```

Tebrikler, siteniz artık yayında! PM2 ayarlarınızı kaydetmek için `pm2 save` komutunu çalıştırmayı unutmayın.
