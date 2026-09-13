import os
fpath = r"C:\Users\Okyanus\Downloads\ReplitExport-saraccevdetbart\Match-Data-Hub\artifacts\football-app\src\pages\LiveMatchesPage.tsx"
with open(fpath, "r", encoding="utf-8") as f:
    code = f.read()

target = "export default function LiveMatchesPage() {"
injection = """export default function LiveMatchesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);"""

code = code.replace(target, injection)

with open(fpath, "w", encoding="utf-8") as f:
    f.write(code)
print("State variables injected!")

