import json, glob, os

files = ['BlogPost.tsx', 'CategoryPage.tsx', 'H2HSearchPage.tsx', 'LoginPage.tsx', 'RegisterPage.tsx', 'PrivacyPolicy.tsx', 'BlogHome.tsx']
found = {}

for f in glob.glob(r'C:\Users\Okyanus\.gemini\antigravity\brain\*\.system_generated\logs\transcript_full.jsonl'):
    try:
        with open(f, encoding='utf-8') as fh:
            for l in fh:
                if not l.strip(): continue
                try:
                    data = json.loads(l)
                    for t in data.get('tool_calls', []):
                        if 'write_to_file' in t['name']:
                            args = t.get('args', {})
                            target = args.get('TargetFile', '')
                            for target_name in files:
                                if target_name in target:
                                    found[target_name] = (f, args.get('CodeContent', ''))
                except json.JSONDecodeError:
                    pass
    except Exception as e:
        pass

for name, (transcript, content) in found.items():
    print(f"Recovering {name} from {os.path.basename(os.path.dirname(os.path.dirname(os.path.dirname(transcript))))}")
    with open(f"artifacts/football-app/src/pages/{name}", 'w', encoding='utf-8') as out:
        out.write(content)
