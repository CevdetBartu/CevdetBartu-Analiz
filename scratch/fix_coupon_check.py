import os
fpath = r"C:\Users\Okyanus\Downloads\ReplitExport-saraccevdetbart\Match-Data-Hub\artifacts\api-server\src\routes\coupon.ts"
with open(fpath, "r", encoding="utf-8") as f:
    code = f.read()

code = code.replace("if (stat.yuzde >= 75 && stat.yuzde < 100) {", "if (stat && typeof stat.yuzde === \"number\" && stat.yuzde >= 75 && stat.yuzde < 100) {")

with open(fpath, "w", encoding="utf-8") as f:
    f.write(code)
print("Updated coupon.ts")

