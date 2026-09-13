import re, os

target_pattern = re.compile(r'"name"\s*:\s*"(write_to_file|replace_file_content)".*?"TargetFile"\s*:\s*"[^"]*AnalysisModal\.tsx".*?"CodeContent"\s*:\s*"(.*?)"(?:,"Description"|,"Overwrite"|,"TargetFile"|,"AllowMultiple"|,"Instruction"|,"EndLine"|,"StartLine"|,"ReplacementContent"|,"TargetContent"|})', re.IGNORECASE)

with open(r'C:\Users\Okyanus\.gemini\antigravity\brain\40f436a5-215f-4410-940d-92b581e87eb4\.system_generated\logs\transcript_full.jsonl', encoding='utf-8', errors='ignore') as fh:
    for l in fh:
        match = target_pattern.search(l)
        if match:
            code = match.group(2).encode('utf-8').decode('unicode_escape')
            with open('artifacts/football-app/src/components/AnalysisModal.tsx', 'w', encoding='utf-8') as out:
                out.write(code)
            print("Extracted AnalysisModal!")
            exit(0)

# Check f02a2ce8
with open(r'C:\Users\Okyanus\.gemini\antigravity\brain\f02a2ce8-8fdf-4231-bcd6-11e5a25fa7ff\.system_generated\logs\transcript_full.jsonl', encoding='utf-8', errors='ignore') as fh:
    for l in fh:
        match = target_pattern.search(l)
        if match:
            code = match.group(2).encode('utf-8').decode('unicode_escape')
            with open('artifacts/football-app/src/components/AnalysisModal.tsx', 'w', encoding='utf-8') as out:
                out.write(code)
            print("Extracted AnalysisModal from current session!")
            exit(0)
