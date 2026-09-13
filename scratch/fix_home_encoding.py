import os
fpath = r"C:\Users\Okyanus\Downloads\ReplitExport-saraccevdetbart\Match-Data-Hub\artifacts\football-app\src\pages\Home.tsx"
with open(fpath, "r", encoding="utf-8") as f:
    code = f.read()

code = code.replace("GEL?M? YAPAY ZEKA", "GELİŞMİŞ YAPAY ZEKA")
code = code.replace("FUTBOL ANALZ", "FUTBOL ANALİZ")
code = code.replace("SSTEM", "SİSTEMİ")
code = code.replace("-KLD", "ÖKLİD")
code = code.replace("ddaa bǬro", "İddaa büro")
code = code.replace("zaman snǬmlemeli", "zaman sönümlemeli")
code = code.replace("-klid", "Öklid")
code = code.replace("canl", "canlı")
code = code.replace("basn", "basınç")
code = code.replace("Ǭcretsiz", "ücretsiz")
code = code.replace("BǬlten (Mackolik)", "Bülten (Mackolik)")
code = code.replace("Algoritma BaYars", "Algoritma Başarısı")
code = code.replace("Veritaban", "Veritabanı")
code = code.replace("Hafzas", "Hafızası")
code = code.replace("Kaytl", "Kayıtlı")
code = code.replace("Ys?", "🚀")
code = code.replace("0 ?", "0 ₺")

with open(fpath, "w", encoding="utf-8") as f:
    f.write(code)
print("Home.tsx encoding fixed using Python replace!")

