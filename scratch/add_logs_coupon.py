import re
fpath = r"C:\Users\Okyanus\Downloads\ReplitExport-saraccevdetbart\Match-Data-Hub\artifacts\api-server\src\routes\coupon.ts"
with open(fpath, "r", encoding="utf-8") as f:
    code = f.read()

code = code.replace("""router.get("/coupon-of-the-day", async (req, res): Promise<void> => {""", """router.get("/coupon-of-the-day", async (req, res): Promise<void> => {
  logger.info("Coupon endpoint hit!");""")

code = code.replace("""res.json(finalCoupon);""", """logger.info("Coupon endpoint returning finalCoupon length: " + finalCoupon.length);
    res.json(finalCoupon);""")

with open(fpath, "w", encoding="utf-8") as f:
    f.write(code)
print("Updated coupon.ts logs!")

