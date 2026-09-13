import json
with open('C:/Users/Okyanus/.gemini/antigravity/brain/f02a2ce8-8fdf-4231-bcd6-11e5a25fa7ff/.system_generated/logs/transcript_full.jsonl', 'r', encoding='utf-8') as f:
    for line in f:
        try:
            d = json.loads(line)
            if d.get('step_index') == 702:
                print(line)
        except:
            pass
