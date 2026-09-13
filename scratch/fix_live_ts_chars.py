import re
fpath = r"C:\Users\Okyanus\Downloads\ReplitExport-saraccevdetbart\Match-Data-Hub\artifacts\api-server\src\routes\live.ts"
with open(fpath, "r", encoding="utf-8") as f:
    code = f.read()

target = """      const normalizeStr = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");"""

injection = """      const normalizeStr = (s: string) => {
        return (s || "").toLowerCase()
          .replace(/ç/g, "c").replace(/ğ/g, "g").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ş/g, "s").replace(/ü/g, "u")
          .replace(/[^a-z0-9]/g, "");
      };"""

if target in code:
    code = code.replace(target, injection)
    with open(fpath, "w", encoding="utf-8") as f:
        f.write(code)
    print("live.ts char mapping fixed!")
else:
    print("Target not found.")

