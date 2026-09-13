import os
import re

fpath = r"C:\Users\Okyanus\Downloads\ReplitExport-saraccevdetbart\Match-Data-Hub\artifacts\api-server\src\routes\coupon.ts"
with open(fpath, "r", encoding="utf-8") as f:
    code = f.read()

code = code.replace("logger.error({ err: e }, \"coupon-of-the-day route error\");", "console.error(e); logger.error({ err: e }, \"coupon-of-the-day route error\");")

with open(fpath, "w", encoding="utf-8") as f:
    f.write(code)
print("Updated coupon.ts")

