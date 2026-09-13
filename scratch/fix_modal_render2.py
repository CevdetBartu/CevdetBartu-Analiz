import os
import re
fpath = r"C:\Users\Okyanus\Downloads\ReplitExport-saraccevdetbart\Match-Data-Hub\artifacts\football-app\src\pages\LiveMatchesPage.tsx"
with open(fpath, "r", encoding="utf-8") as f:
    code = f.read()

modal_render = """      <AnalysisModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        match={selectedMatch}
      />
    </div>"""

code = re.sub(r"</div>\s*\);\s*}\s*$", modal_render + "\n  );\n}\n", code)

with open(fpath, "w", encoding="utf-8") as f:
    f.write(code)
print("Modal correctly injected with regex!")

