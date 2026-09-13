import sqlite3
import json

conn = sqlite3.connect('scripts/scraper/gecmis_maclar.db')

with open('target_leagues.json', 'r', encoding='utf-8') as f:
    target_list = json.load(f)

# Normalize target list to just "League Name" or "League Name - Country"
# In the DB, the 'lig' column contains things like "Ingiltere Premier Lig", "Turkiye Super Lig", "Spain - LaLiga"
# The user's list has "Premier League - İngiltere", "Süper Lig - Türkiye".
# This requires some smart mapping!
