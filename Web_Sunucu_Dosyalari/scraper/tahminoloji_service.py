import requests
import datetime
import json
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

class TahminolojiService:
    BASE_URL = "https://tahminoloji.com/tr/predictions"
    HEADERS = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json, text/plain, */*"
    }

    @classmethod
    def fetch_daily_predictions(cls, date_str=None):
        """
        Tahminoloji'nin /getdata/{DD-MM-YYYY} canlı API ucundan tüm günün istatistiksel matris verisini çeker.
        """
        if not date_str:
            date_str = datetime.datetime.now().strftime("%d-%m-%Y")

        url = f"{cls.BASE_URL}/getdata/{date_str}"
        logging.info(f"Fetching Tahminoloji live data from {url}...")

        try:
            r = requests.get(url, headers=cls.HEADERS, timeout=15)
            if r.status_code == 200:
                data = r.json()
                if data and "data" in data:
                    matches = data["data"]
                    logging.info(f"Successfully fetched {len(matches)} matches from Tahminoloji!")
                    return matches
            logging.warning(f"Tahminoloji response error: {r.status_code}")
            return []
        except Exception as e:
            logging.error(f"Failed to fetch Tahminoloji predictions: {e}")
            return []

    @classmethod
    def find_match_by_teams(cls, home_team, away_team, date_str=None):
        """
        Ev sahibi ve deplasman takımlarının adına göre Tahminoloji canlı istatistiklerini bulur.
        """
        matches = cls.fetch_daily_predictions(date_str)
        home_clean = home_team.lower().strip()
        away_clean = away_team.lower().strip()

        for m in matches:
            t_home = m.get("homeTeamName", "").lower()
            t_away = m.get("awayTeamName", "").lower()

            if (home_clean in t_home or t_home in home_clean) and (away_clean in t_away or t_away in away_clean):
                return m
        return None

if __name__ == "__main__":
    matches = TahminolojiService.fetch_daily_predictions()
    if matches:
        print(f"Total Tahminoloji matches today: {len(matches)}")
        print("Sample match data:")
        print(json.dumps(matches[0], indent=2))
