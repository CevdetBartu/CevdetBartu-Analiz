import re
import json

html = open('fs_m.html', 'r', encoding='utf-8').read()
matches = []
leagues = html.split('<h4>')
for l in leagues[1:]:
    league_name = l.split('</h4>')[0].strip()
    league_name = re.sub(r'<[^>]+>', '', league_name)
    for match_chunk in re.split(r'<br />|<br/>', l):
        if 'class="live"' in match_chunk:
            m = re.search(r'<span class="live">([^<]+)</span>([^<]+)<a href="/match/([^/]+)/" class="live">([^<]+)</a>', match_chunk)
            if m:
                minute = m.group(1).strip()
                teams = m.group(2).strip()
                match_id = m.group(3)
                score = m.group(4).strip()
                try:
                    home, away = teams.split(' - ', 1)
                    home_score, away_score = score.split('-', 1)
                    matches.append({
                        'league': league_name, 'id': match_id,
                        'home': home.strip(), 'away': away.strip(),
                        'home_score': home_score.strip(), 'away_score': away_score.strip(),
                        'minute': minute
                    })
                except Exception as e:
                    pass

print(json.dumps(matches[:3], indent=2))
print('Total parsed:', len(matches))
