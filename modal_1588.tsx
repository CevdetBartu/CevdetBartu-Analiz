import json
import glob
import os

found_files = []

for f in glob.glob(r'C:\Users\Okyanus\.gemini\antigravity\brain\*\.system_generated\logs\transcript_full.jsonl'):
    try:
        with open(f, encoding='utf-8', errors='ignore') as fh:
            for line in fh:
                # We want to find the raw code, regardless of whether it's write_to_file or something else
                if 'export function AnalysisModal' in line and '"CodeContent"' in line:
                    found_files.append((f, line))
    except Exception as e:
        print(f"Error reading {f}: {e}")

if found_files:
    print(f"Found {len(found_files)} occurrences!")
    # Just take the first one and try to extract the code
    f, l = found_files[0]
    print(f"Extracting from {f}")
    
    # Very robust extraction
    start = l.find('"CodeContent":"')
    if start != -1:
        end_desc = l.find('","Description"', start)
        end_over = l.find('","Overwrite"', start)
        end_targ = l.find('","TargetFile"', start)
        ends = [e for e in [end_desc, end_over, end_targ] if e != -1]
        if ends:
            end = min(ends)
            code = l[start+15:end]
            
            with open('artifacts/football-app/src/components/AnalysisModal.tsx', 'w', encoding='utf-8') as out:
                out.write(code.encode('utf-8').decode('unicode_escape'))
            print("Successfully extracted AnalysisModal.tsx!")
        else:
            print("Could not find end delimiter.")
    else:
        print("Could not find CodeContent start.")
else:
    print("Not found anywhere.")
