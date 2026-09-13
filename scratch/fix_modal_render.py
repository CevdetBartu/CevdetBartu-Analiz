import os
fpath = r"C:\Users\Okyanus\Downloads\ReplitExport-saraccevdetbart\Match-Data-Hub\artifacts\football-app\src\pages\LiveMatchesPage.tsx"
with open(fpath, "r", encoding="utf-8") as f:
    code = f.read()

modal_render = """
      <AnalysisModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        match={selectedMatch}
      />
    </div>
  );
}"""

if "<AnalysisModal" not in code:
    code = code.replace("    </div>\\n  );\\n}", modal_render)
    with open(fpath, "w", encoding="utf-8") as f:
        f.write(code)
    print("Modal injected!")
else:
    print("Already injected.")

