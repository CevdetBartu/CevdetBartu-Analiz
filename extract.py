import json, glob

found = {}
for f in glob.glob(r'C:\Users\Okyanus\.gemini\antigravity\brain\*\.system_generated\logs\transcript_full.jsonl'):
    try:
        with open(f, encoding='utf-8') as fh:
            for i, l in enumerate(fh):
                if not l.strip(): continue
                try:
                    data = json.loads(l)
                    for tc in data.get('tool_calls', []):
                        if tc['name'] in ['default_api:write_to_file', 'default_api:replace_file_content', 'write_to_file', 'replace_file_content']:
                            args = tc.get('args', tc.get('arguments', {}))
                            target = args.get('TargetFile', '')
                            if 'DashboardView.tsx' in target:
                                content = args.get('CodeContent', '') or args.get('ReplacementContent', '')
                                print(f"File {f}, Line {i}, length {len(content)}")
                                with open(f"extracted_dashboard_{i}.tsx", "w", encoding="utf-8") as out:
                                    out.write(content)
                except Exception as e:
                    pass
    except Exception as e:
        pass
