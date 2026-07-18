@echo off
title CevdetBartu Futbol Analiz Sistemi
chcp 65001 > nul
cd /d "%~dp0"

echo ====================================================
echo   CEVDETBARTU FUTBOL ANALIZ SISTEMI BASLATILIYOR
echo ====================================================

echo 1. API Sunucusu Baslatiliyor...
start "API Sunucusu" cmd /k "%USERPROFILE%\.bun\bin\bun.exe" --cwd apps/api-server run dev

echo 2. Arayüz (Frontend) Baslatiliyor...
start "Arayüz (Frontend)" cmd /k "%USERPROFILE%\.bun\bin\bun.exe" --cwd apps/football-app run dev"

echo 3. Veri Çekici (Scraper) Baslatiliyor...
start "Veri Cekici (Scraper)" cmd /k "set PYTHONIOENCODING=utf-8 && .venv\Scripts\python apps/scraper-service/run.py"

echo ====================================================
echo   Sistem basariyla baslatildi!
echo   Tarayicinizdan http://localhost:5173 adresine girin.
echo   Bu pencereyi kapatabilirsiniz, diger pencereler 
echo   arka planda calismaya devam edecektir.
echo ====================================================
timeout /t 5
