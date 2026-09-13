import re
fpath = r"C:\Users\Okyanus\Downloads\ReplitExport-saraccevdetbart\Match-Data-Hub\artifacts\api-server\src\routes\index.ts"
with open(fpath, "r", encoding="utf-8") as f:
    code = f.read()

if "import couponRouter" not in code:
    code = code.replace("import todayRouter from \"./today\";", "import todayRouter from \"./today\";\nimport couponRouter from \"./coupon\";")
    code = code.replace("router.use(todayRouter);", "router.use(todayRouter);\nrouter.use(couponRouter);")
    with open(fpath, "w", encoding="utf-8") as f:
        f.write(code)
    print("Registered coupon router!")
else:
    print("Already registered.")

