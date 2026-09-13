import os

search_dirs = [
    r"c:\Users\Okyanus\Downloads\ReplitExport-saraccevdetbart\Match-Data-Hub\artifacts\api-server\src",
    r"c:\Users\Okyanus\Downloads\ReplitExport-saraccevdetbart\Match-Data-Hub\artifacts\football-app\src"
]

for sdir in search_dirs:
    for root, dirs, files in os.walk(sdir):
        for file in files:
            if file.endswith(('.ts', '.tsx')):
                fpath = os.path.join(root, file)
                with open(fpath, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                    if 'maxResults' in content or '50' in content or 'findSimilarMatches' in content:
                        lines = content.split('\n')
                        for i, line in enumerate(lines, 1):
                            if any(k in line for k in ['maxResults', 'max_results', 'limit', 'SimilarMatches', 'MAX_SIMILAR']):
                                print(f"{file}:{i} -> {line.strip()[:140]}")
