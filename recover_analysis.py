import json

with open(r'C:\Users\Okyanus\.gemini\antigravity\brain\40f436a5-215f-4410-940d-92b581e87eb4\.system_generated\logs\transcript_full.jsonl', encoding='utf-8') as f:
    for l in f:
        if 'AnalysisModal.tsx' in l and '"name":"write_to_file"' in l:
            data = json.loads(l)
            for t in data.get('tool_calls', []):
                if t['name'] == 'write_to_file' and 'AnalysisModal.tsx' in t.get('args', {}).get('TargetFile', ''):
                    with open('artifacts/football-app/src/components/AnalysisModal.tsx', 'w', encoding='utf-8') as out:
                        out.write(t['args']['CodeContent'])
                    print("Recovered AnalysisModal!")
                    exit(0)
