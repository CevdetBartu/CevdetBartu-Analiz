import logging
import urllib.request
import re
import json
import ssl
import time
from concurrent.futures import ThreadPoolExecutor

logger = logging.getLogger("scraper.live_matches")

# Global in-memory cache for live matches rolling window history
live_history = {}

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

def parse_flashscore_feed(feed_str):
    parts = feed_str.split('~')
    stats = {}
    is_match_section = True
    for part in parts:
        cleaned = re.sub(r'[^\x20-\x7E]+', '|', part)
        if not cleaned.startswith('|'): cleaned = '|' + cleaned
        if not cleaned.endswith('|'): cleaned = cleaned + '|'
        
        if '|SE|' in cleaned:
            is_match_section = 'match' in cleaned.lower()
            
        if not is_match_section: continue
        
        sg = re.search(r'\|SG\|([^|]+)\|', cleaned)
        sh = re.search(r'\|SH\|([^|]+)\|', cleaned)
        si = re.search(r'\|SI\|([^|]+)\|', cleaned)
        if sg and sh and si:
            stats[sg.group(1).strip()] = {'home': sh.group(1).strip(), 'away': si.group(1).strip()}
    return stats

def safe_float(s):
    if not s: return 0.0
    try:
        return float(s.replace('%', '').strip())
    except Exception:
        return 0.0

def safe_int(s):
    if not s: return 0
    try:
        return int(s.replace('%', '').strip())
    except Exception:
        return 0

def process_single_match(match_info):
    mid = match_info['id']
    url = f'https://m.flashscore.com/match/{mid}/?t=stats'
    raw_stats = {}
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, context=ctx, timeout=5) as resp:
            html = resp.read().decode('utf-8')
        env = re.search(r'window\.environment\s*=\s*(\{.*?\});', html, flags=re.DOTALL)
        if env:
            feed = json.loads(env.group(1)).get('props', {}).get('feed', '')
            raw_stats = parse_flashscore_feed(feed)
            
        # Also fetch summary to get HT score
        req_sum = urllib.request.Request(f'https://m.flashscore.com/match/{mid}/', headers=headers)
        with urllib.request.urlopen(req_sum, context=ctx, timeout=5) as resp_sum:
            sum_html = resp_sum.read().decode('utf-8')
        m_ht = re.search(r'<h4>1st Half:\s*<b>(\d+)-(\d+)</b></h4>', sum_html)
        if m_ht:
            match_info['score_ht_h'] = int(m_ht.group(1))
            match_info['score_ht_a'] = int(m_ht.group(2))
            
        m_odds = re.search(r'<p class="p-set odds-detail[^"]*">.*?<a[^>]*>([\d\.]+)</a>\s*\|\s*<a[^>]*>([\d\.]+)</a>\s*\|\s*<a[^>]*>([\d\.]+)</a>', sum_html)
        if m_odds:
            match_info['pre_match_odds'] = {
                "1": m_odds.group(1),
                "X": m_odds.group(2),
                "2": m_odds.group(3)
            }


    except Exception as e:
        logger.debug(f"Stats fetch error for {mid}: {e}")

    # Map to standard format
    s = {}
    def get_val(key, side, func=safe_int):
        return func(raw_stats.get(key, {}).get(side, '0'))
        
    s['possession_h'] = get_val('Ball possession', 'home')
    s['possession_a'] = get_val('Ball possession', 'away')
    s['shots_target_h'] = get_val('Shots on target', 'home')
    s['shots_target_a'] = get_val('Shots on target', 'away')
    s['shots_off_h'] = get_val('Shots off target', 'home')
    s['shots_off_a'] = get_val('Shots off target', 'away')
    s['shots_total_h'] = get_val('Total shots', 'home')
    s['shots_total_a'] = get_val('Total shots', 'away')
    s['corners_h'] = get_val('Corner kicks', 'home')
    s['corners_a'] = get_val('Corner kicks', 'away')
    s['yellow_h'] = get_val('Yellow cards', 'home')
    s['yellow_a'] = get_val('Yellow cards', 'away')
    s['red_h'] = get_val('Red cards', 'home')
    s['red_a'] = get_val('Red cards', 'away')
    s['fouls_h'] = get_val('Fouls', 'home')
    s['fouls_a'] = get_val('Fouls', 'away')
    
    # Advanced / xG metrics
    s['xg_h'] = get_val('Expected goals (xG)', 'home', safe_float)
    s['xg_a'] = get_val('Expected goals (xG)', 'away', safe_float)
    s['big_chances_h'] = get_val('Big chances', 'home')
    s['big_chances_a'] = get_val('Big chances', 'away')
    s['touches_in_box_h'] = get_val('Touches in opposition box', 'home')
    s['touches_in_box_a'] = get_val('Touches in opposition box', 'away')
    s['shots_inside_box_h'] = get_val('Shots inside the box', 'home')
    s['shots_inside_box_a'] = get_val('Shots inside the box', 'away')
    
    match_info['stats'] = s
    
    # Calculate Pressing / Alarm Colors
    minute_str = match_info['minute']
    minute = safe_int(minute_str) if str(minute_str).isdigit() else 45
    if '+' in str(minute_str):
        minute = safe_int(str(minute_str).split('+')[0])

    match_info['status_color'] = {'home': 'gray', 'away': 'gray'}
    match_info['pressure'] = {'home': 0, 'away': 0, 'tempo': 0}
    
    if minute >= 10:
        # Simple Pressing Index (Shots on Target + Corners + Big Chances)
        press_h = s['shots_target_h'] * 2 + s['corners_h'] * 1.5 + s['big_chances_h'] * 3 + s['shots_inside_box_h']
        press_a = s['shots_target_a'] * 2 + s['corners_a'] * 1.5 + s['big_chances_a'] * 3 + s['shots_inside_box_a']
        tempo = press_h + press_a + (s['shots_total_h'] + s['shots_total_a'])
        
        match_info['pressure'] = {
            'home': round(press_h, 1),
            'away': round(press_a, 1),
            'tempo': round(tempo, 1)
        }
        
        # ALARM LOGIC (Green = Heavy Pressure, Yellow = Moderate Pressure)
        # Condition for Home Green:
        # Either (xG > 1.2 & score == 0) OR (Big Chances >= 2 & score == 0) OR (corners > 6 & shots on target >= 5)
        if match_info['score_h'] == 0 and (s['xg_h'] >= 1.2 or s['big_chances_h'] >= 2):
            match_info['status_color']['home'] = 'green'
        elif s['possession_h'] > 60 and (s['shots_target_h'] >= 4 or s['corners_h'] >= 5):
            match_info['status_color']['home'] = 'yellow'
            
        if match_info['score_a'] == 0 and (s['xg_a'] >= 1.2 or s['big_chances_a'] >= 2):
            match_info['status_color']['away'] = 'green'
        elif s['possession_a'] > 60 and (s['shots_target_a'] >= 4 or s['corners_a'] >= 5):
            match_info['status_color']['away'] = 'yellow'
            
    return match_info

def get_live_matches_data():
    logger.info("Fetching live matches from Flashscore (100% FS Fallback Engine)...")
    try:
        req = urllib.request.Request("https://m.flashscore.com/?s=2", headers=headers)
        with urllib.request.urlopen(req, context=ctx, timeout=8) as response:
            html = response.read().decode("utf-8")
    except Exception as e:
        logger.error(f"Error fetching flashscore homepage: {e}")
        return []
        
    matches = []
    leagues = html.split('<h4>')
    for l in leagues[1:]:
        league_name = l.split('</h4>')[0].strip()
        league_name = re.sub(r'<[^>]+>', '', league_name).strip()
        if league_name.endswith("Standings"):
            league_name = league_name[:-9].strip()
            
        for match_chunk in re.split(r'<br />|<br/>', l):
            if 'class="live"' in match_chunk:
                m = re.search(r'<span class="live">([^<]+)</span>([^<]+)<a href="/match/([^/]+)/[^>]*>([^<]+)</a>', match_chunk)
                if m:
                    minute = m.group(1).strip()
                    teams = m.group(2).strip()
                    match_id = m.group(3)
                    score = m.group(4).strip()
                    
                    try:
                        home, away = teams.split(' - ', 1)
                        home_score, away_score = score.split('-', 1)
                        matches.append({
                            'id': match_id,
                            'homeTeam': home.strip(),
                            'awayTeam': away.strip(),
                            'league': league_name,
                            'score_h': int(home_score.strip()),
                            'score_a': int(away_score.strip()),
                            'minute': minute,
                            'country': league_name.split(':')[0] if ':' in league_name else 'World',
                            'status': 'inprogress',
                            'status_description': minute
                        })
                    except Exception as e:
                        pass
                        
    # Fetch stats concurrently
    with ThreadPoolExecutor(max_workers=10) as executor:
        final_matches = list(executor.map(process_single_match, matches))
        
    logger.info(f"Successfully processed {len(final_matches)} live matches from Flashscore.")
    return final_matches
