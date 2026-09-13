# 📌 CANLI BASINÇ ALARMI (hyp_2026-07-20_live_green_alarm_edge) — AĞUSTOS DIŞ-ÖRNEKLEM SIKI DOĞRULAMA TESTİ PROMPTU

Bu doküman, Ağustos 2026 dış-örneklem dönemi geldiğinde `hyp_2026-07-20_live_green_alarm_edge` hipotezini test edecek kanonik talimat metnidir.

---

## 📋 UYGULANACAK 8 ADIMLI PROTOKOL

### 1. Veri ve Dönem Ayrımı (Data Leakage Kontrolü)
- İç-örneklem (in-sample): Hipotezin keşfedildiği Temmuz 2026 verisi.
- Dış-örneklem (out-of-sample): Ağustos 2026 verisinin tamamı (hiç görülmemiş veri).

### 2. Eşleştirilmiş Kontrol Grubu (Matched-Pair Setup)
- Threshold=25.0 alarmının tetiklendiği her maç için aynı dönemden, alarmın tetiklenmediği ancak lig seviyesi, oran aralığı ve maç dakikası benzer olan kontrol maçı eşleştirilir.

### 3. İstatistiksel Test: McNemar Testi
- Alarm grubu ile eşleştirilmiş kontrol grubu arasında ikili eşleştirilmiş McNemar testi ($p$-value) hesaplanır.

### 4. Sonuç Metriği: ROI (Net Kârlılık)
- Sadece gol dönüşüm oranı değil, gerçek bahis ROI farkı ($\Delta ROI$) test edilir.

### 5. Çoklu-Eşik Bonferroni Düzeltmesi
- Thresholds: 20.0, 25.0, 30.0, 35.0 için Bonferroni düzeltmeli anlamlılık eşiği ($\alpha / n = 0.05 / 4 = 0.0125$) uygulanır.

### 6. Determinizm ve Tekrarlanabilirlik
- Kanonik test motoru 2 kez ardışık çalıştırılır, $N$ ve $p$-değerinin %100 aynı çıktığı doğrulanır.

### 7. Katı Dil Kısıtlaması
- Mutlak ifadeler ("kesinleşmiştir", "%100 doğrulanmıştır") yasaktır. İstatistiki $p$-değeri, $\Delta ROI$ ve $N$ ile raporlanır.

### 8. Sonuç ve Karar Protokolü
- Düzeltilmiş eşiği geçerse $\rightarrow$ Production adayı.
- Geçemezse $\rightarrow$ `archived_rejected` arşivine mühürleme.
- Sınırda kalırsa $\rightarrow$ `pending_validation` durumunda tutma.
