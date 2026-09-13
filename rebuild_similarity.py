import codecs

path = 'artifacts/api-server/src/lib/similarity.ts'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

# 1. Update ScoreBreakdown
if "rawScore?: number;" not in content:
    content = content.replace(
        "export interface ScoreBreakdown {\n  oddsScore: number;\n  leagueScore: number;\n  cardScore: number;\n}",
        "export interface ScoreBreakdown {\n  oddsScore: number;\n  leagueScore: number;\n  cardScore: number;\n  rawScore?: number;\n  contextBonus?: number;\n}"
    )

# 2. Rebuild getLeagueContinent
continent_logic = """
export function getLeagueContinent(leagueName?: string | null): string {
  if (!leagueName) return "UNKNOWN";
  const norm = leagueName.toLowerCase();
  
  if (norm.includes("uefa") || norm.includes("champions league") || norm.includes("europa") || norm.includes("euro")) return "EUROPE";
  if (norm.includes("libertadores") || norm.includes("sudamericana") || norm.includes("copa america")) return "SOUTH_AMERICA";
  if (norm.includes("afc") || norm.includes("asian")) return "ASIA";
  if (norm.includes("caf") || norm.includes("african")) return "AFRICA";
  if (norm.includes("concacaf") || norm.includes("gold cup")) return "NORTH_AMERICA";
  if (norm.includes("world cup") || norm.includes("fifa")) return "WORLD";

  // Domestic Mapping
  const europe = ["ingiltere", "almanya", "italya", "ispanya", "fransa", "turkiye", "hollanda", "portekiz", "belcika", "iskocya", "yunanistan", "rusya", "ukrayna", "isvicre", "avusturya", "isvec", "norvec", "danimarka", "polonya", "romanya", "sirbistan", "hirvatistan", "cek", "macaristan", "irlanda", "galler", "finlandiya", "izlanda", "slovakya", "slovenya", "bulgaristan", "bosna", "karadag", "makedonya", "kosova", "arnavutluk", "kibris", "gurcistan", "ermenistan", "azerbaycan", "kazakistan", "estonya", "letonya", "litvanya", "belarus", "galler", "kuzey irlanda"];
  const south_america = ["brezilya", "arjantin", "kolombiya", "sili", "peru", "uruguay", "ekvador", "paraguay", "bolivya", "venezuela"];
  const north_america = ["abd", "meksika", "kanada", "kosta rika", "honduras", "panama", "jamaika", "el salvador", "guatemala"];
  const asia = ["japonya", "guney kore", "cin", "avustralya", "iran", "suudi arabistan", "bae", "katar", "ozbekistan", "irak", "umman", "suriye", "urdun", "bahreyn", "kuveyt", "yemen", "lbnan", "filistin", "hindistan", "tayland", "vietnam", "malezya", "endonezya", "singapur"];
  const africa = ["misir", "fas", "cezayir", "tunus", "senegal", "nijerya", "kamerun", "fildisi", "gana", "mali", "guney afrika", "zambiya", "uganda", "kenya"];

  if (europe.some(c => norm.includes(c))) return "EUROPE";
  if (south_america.some(c => norm.includes(c))) return "SOUTH_AMERICA";
  if (north_america.some(c => norm.includes(c))) return "NORTH_AMERICA";
  if (asia.some(c => norm.includes(c))) return "ASIA";
  if (africa.some(c => norm.includes(c))) return "AFRICA";

  return "UNKNOWN";
}
"""
start_idx = content.find("export function getLeagueContinent")
end_idx = content.find("export function scoreMatch")
if start_idx != -1 and end_idx != -1:
    content = content[:start_idx] + continent_logic + content[end_idx:]

# 3. Rebuild the bottom of the file (from findSimilarMatches)
# First we need to find "export function findSimilarMatches"
find_idx = content.find("export function findSimilarMatches")

new_find_logic = """export function findSimilarMatches(
  query: SimilarityQuery,
  allMatches: HistoricalMatch[]
): SimilarMatchResult[] {
  const qLig = query.league ? norm(query.league) : "";
  const qIsNational = isNationalTeamMatch(query.league);
  const qIsContinentalClub = isContinentalClubMatch(query.league);
  const qContinent = query.kita || getLeagueContinent(query.league);

  let targetCountrySynonyms: string[] = [];
  if (!qIsContinentalClub && !qIsNational) {
    for (const [key, synonyms] of Object.entries(countryMap)) {
      if (synonyms.some(syn => qLig.startsWith(syn) || qLig.includes(syn))) {
        targetCountrySynonyms = synonyms;
        break;
      }
    }
  }

  const isTargetMatchSameCountry = (mLig: string) => {
    if (targetCountrySynonyms.length > 0) {
      return targetCountrySynonyms.some(syn => {
        // Use word boundaries to prevent 'usa' matching 'ulusal'
        const regex = new RegExp(`\\\\b${syn}\\\\b`, 'i');
        return regex.test(mLig);
      });
    }
    return qLig === mLig || qLig.includes(mLig) || mLig.includes(qLig);
  };

  // Pre-score all matches
  const scoredAll = allMatches.map(m => scoreMatch(query, m));

  const results: SimilarMatchResult[] = [];

  for (const item of scoredAll) {
    const mLigRaw = item.match.league || "";
    const mLig = norm(mLigRaw);
    const mIsNational = isNationalTeamMatch(mLigRaw);
    const mIsContinentalClub = isContinentalClubMatch(mLigRaw);
    const mContinent = getLeagueContinent(mLigRaw);
    const mIsFriendly = mLig.includes("hazirlik") || mLig.includes("friendly");
    const qIsFriendly = qLig.includes("hazirlik") || qLig.includes("friendly");

    let rawScore = item.similarityScore;
    let bonus = 0;

    // Yüksek öncelikli kurallar
    if (qIsFriendly !== mIsFriendly) {
        bonus -= 20.0;
    }
    
    if (qIsNational !== mIsNational) {
        bonus -= 15.0; 
    }

    // Bağlamsal Bonuslar / Penaltılar
    if (qIsContinentalClub) {
      if (mIsContinentalClub) {
        bonus += 2.0;
      } else if (mContinent !== "UNKNOWN" && qContinent !== "UNKNOWN" && mContinent === qContinent) {
        bonus += 0.0;
      } else {
        bonus -= 5.0; 
      }
    } else if (qIsNational) {
      if (mContinent !== "UNKNOWN" && qContinent !== "UNKNOWN" && mContinent === qContinent) {
        bonus += 3.0;
      } else {
        bonus -= 2.0;
      }
    } else {
      // Yerel Ligler
      if (isTargetMatchSameCountry(mLig)) {
        bonus += 5.0; // Aynı ülke bonusu
      } else if (mContinent !== "UNKNOWN" && qContinent !== "UNKNOWN" && mContinent === qContinent) {
        bonus += 1.5; // Aynı kıta bonusu
      } else {
        bonus -= 4.0; // Farklı kıta penaltısı
      }
    }
    
    item.similarityScore = Math.max(0.0, Math.min(100.0, rawScore + bonus));
    item.scoreBreakdown.rawScore = Math.round(rawScore * 10) / 10;
    item.scoreBreakdown.contextBonus = bonus;
    results.push(item);
  }

  // Tüm maçları sırala
  results.sort((a, b) => b.similarityScore - a.similarityScore);

  const finalResults = query.strict100 ? results.filter(m => Math.round(m.similarityScore) === 100) : results.filter(m => m.similarityScore >= 80);
  const maxResults = query.strict100 ? Math.min(query.maxResults ?? 150, 150) : query.maxResults ?? 150;
  return finalResults.slice(0, maxResults);
}
"""

if find_idx != -1:
    content = content[:find_idx] + new_find_logic
    with codecs.open(path, 'w', 'utf-8') as f:
        f.write(content)
    print("Fully rebuilt similarity.ts bottom section!")
else:
    print("Could not find findSimilarMatches")
