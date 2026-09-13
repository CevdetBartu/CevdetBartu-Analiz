import codecs

path = 'artifacts/api-server/src/lib/similarity.ts'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

country_map = """
const countryMap: Record<string, string[]> = {
  "turkiye": ["turkey", "turkiye", "turkish", "süper lig", "tff", "1. lig"],
  "ingiltere": ["england", "ingiltere", "english", "premier league", "championship", "league one"],
  "ispanya": ["spain", "ispanya", "spanish", "la liga", "segunda"],
  "almanya": ["germany", "almanya", "german", "bundesliga", "2. bundesliga"],
  "italya": ["italy", "italya", "italian", "serie a", "serie b"],
  "fransa": ["france", "fransa", "french", "ligue 1", "ligue 2"],
  "hollanda": ["netherlands", "hollanda", "dutch", "eredivisie"],
  "portekiz": ["portugal", "portekiz", "portuguese", "primeira"],
  "abd": ["usa", "abd", "american", "united states", "major league soccer", "mls"],
  "brezilya": ["brazil", "brezilya", "brazilian", "serie a", "serie b"],
  "arjantin": ["argentina", "arjantin", "argentine", "liga profesional"],
  "norvec": ["norway", "norvec", "norwegian", "eliteserien"]
};
"""

content = content.replace("export function findSimilarMatches", country_map + "\nexport function findSimilarMatches")

with codecs.open(path, 'w', 'utf-8') as f:
    f.write(content)
print("Added countryMap back!")
