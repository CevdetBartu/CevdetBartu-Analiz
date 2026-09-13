@echo off
title Mackolik Gecmis Veri Madencisi (Oto-Yeniden Baslatma)
echo =======================================================
echo Mackolik Madencisi Baslatiliyor...
echo (Eger baglanti koparsa veya cokse otomatik tekrar baslar)
echo =======================================================

:LOOP
python scripts\scraper\historical_mackolik_importer.py
echo.
echo Madenci beklenmedik sekilde durdu. Baglanti veya guncelleme yuzunden olabilir.
echo 10 saniye icinde otomatik olarak kalici kaldigi yerden devam edecek...
timeout /t 10
goto LOOP
