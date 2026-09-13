import glob

found = []

for f in glob.glob(r'C:\Users\Okyanus\.gemini\antigravity\brain\*\.system_generated\logs\transcript_full.jsonl'):
    try:
        with open(f, encoding='utf-8', errors='ignore') as fh:
            for i, line in enumerate(fh):
                if 'export function AnalysisModal' in line and '"CodeContent"' in line:
                    start = line.find('"CodeContent":"')
                    if start != -1:
                        ends = [e for e in [line.find('","Description"', start), line.find('","Overwrite"', start), line.find('","TargetFile"', start)] if e != -1]
                        if ends:
                            code = line[start+15:min(ends)].encode('utf-8').decode('unicode_escape')
                            found.append((f, i, len(code), code))
    except:
        pass

for f, i, size, code in found:
    print(f"File: {f}, Line: {i}, Size: {size}")
    # Write it to a file so we can inspect it
    with open(f"modal_{size}.tsx", "w", encoding="utf-8") as out:
        out.write(code)
