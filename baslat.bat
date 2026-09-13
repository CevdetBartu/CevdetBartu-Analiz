@echo off
echo =======================================================
echo CevdetBartu Futbol Analiz Sistemi Baslatiliyor...
echo =======================================================
echo.
echo Lutfen acilan 4 siyah ekrani (terminali) KAPATMAYIN.
echo Arka planda calismalari gerekiyor.
echo.

REM 1. API Sunucusunu (Arka Ucu) Baslat
echo 1. API Sunucusu (Backend - Port 8080) Baslatiliyor...
start "API Sunucusu (Backend)" cmd /k "pnpm --filter @workspace/api-server run dev"

REM 2. Frontend'i (On Yuz) Baslat
echo 2. Arayuz (Frontend - Port 5173) Baslatiliyor...
start "Arayuz (Frontend)" cmd /k "pnpm --filter @workspace/football-app run dev"

REM 3. Python Flask ve Scraper'i Baslat
echo 3. Python Scraper ve Flask API Baslatiliyor...
start "Python Scraper" cmd /k "python scripts\scraper\run.py"

REM 4. Mackolik Gecmis Veri Madencisi (Gecmise donuk tum maclari ceker)
echo 4. Mackolik Veritabani Madencisi Baslatiliyor...
start "Mackolik Madencisi" cmd /c "gecmis_maclari_devam_ettir.bat"

echo.
echo =======================================================
echo Tum servisler baslatildi!
echo 5 saniye icinde tarayiciniz otomatik olarak acilacaktir...
echo =======================================================
timeout /t 5 >nul

REM Uygulamayi varsayilan tarayicida ac
start http://localhost:5173/

echo Sistem basariyla acildi. Bu pencereyi kapatabilirsiniz (diger 4 siyah ekrani KESINLIKLE kapatmayin).
pause
