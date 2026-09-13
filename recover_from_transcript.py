import json, os, sys

def recover(filename, target_filename, transcript_path):
    print(f"Recovering {target_filename}...")
    for l in open(transcript_path, encoding='utf-8'):
        if not l.strip(): continue
        try:
            data = json.loads(l)
            for t in data.get('tool_calls', []):
                if 'write_to_file' in t['name']:
                    args = t.get('args', {})
                    if target_filename in args.get('TargetFile', ''):
                        with open(filename, 'w', encoding='utf-8') as f:
                            f.write(args.get('CodeContent', ''))
                        print(f"Successfully recovered {target_filename} to {filename}")
                        return
        except Exception as e:
            pass
    print(f"Could not find {target_filename}")

recover('artifacts/football-app/src/pages/BlogHome.tsx', 'BlogHome.tsx', r'C:\Users\Okyanus\.gemini\antigravity\brain\40f436a5-215f-4410-940d-92b581e87eb4\.system_generated\logs\transcript_full.jsonl')
