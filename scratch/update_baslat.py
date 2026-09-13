import os
with open("baslat.bat", "r", encoding="utf-8") as f:
    code = f.read()

code = code.replace(
    'start "Mackolik Madencisi" cmd /k "python scripts\\scraper\\historical_mackolik_importer.py"',
    'start "Mackolik Madencisi" cmd /c "gecmis_maclari_devam_ettir.bat"'
)

with open("baslat.bat", "w", encoding="utf-8") as f:
    f.write(code)
print("Updated baslat.bat")

