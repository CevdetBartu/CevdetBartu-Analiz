import os, glob

for f in glob.glob(r'C:\Users\Okyanus\.gemini\antigravity\brain\*\.system_generated\logs\transcript_full.jsonl'):
    try:
        with open(f, encoding='utf-8') as fh:
            for l in fh:
                if 'AnalysisModal' in l and 'write_to_file' in l:
                    print(f"Found AnalysisModal in {f}")
                    break
    except:
        pass
