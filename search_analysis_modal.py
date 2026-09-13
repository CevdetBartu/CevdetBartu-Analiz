import glob, re
import os

target_pattern = re.compile(r'"TargetFile"\s*:\s*"[^"]*AnalysisModal\.tsx"')

for f in glob.glob(r'C:\Users\Okyanus\.gemini\antigravity\brain\*\.system_generated\logs\transcript_full.jsonl'):
    try:
        with open(f, encoding='utf-8', errors='ignore') as fh:
            for l in fh:
                if target_pattern.search(l):
                    print(f"FOUND in {f}")
    except Exception as e:
        print(f"Error reading {f}: {e}")
