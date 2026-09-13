import json, glob

for f in glob.glob(r'C:\Users\Okyanus\.gemini\antigravity\brain\*\.system_generated\logs\transcript.jsonl'):
    try:
        with open(f, encoding='utf-8') as fh:
            for l in fh:
                if not l.strip(): continue
                try:
                    data = json.loads(l)
                    for tc in data.get('tool_calls', []):
                        print(tc['name'])
                except Exception as e:
                    pass
    except Exception as e:
        pass
