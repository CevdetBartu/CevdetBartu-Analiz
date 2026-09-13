import codecs

path = 'artifacts/api-server/src/lib/similarity.ts'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

# 1. Update getLeagueContinent to include domestic countries
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
content = content[:start_idx] + continent_logic + content[end_idx:]

# 2. Fix findSimilarMatches tier logic to actually modify scores
find_logic = """
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

    // Yüksek öncelikli kurallar
    // 1. Hazırlık maçları SADECE hazırlık maçlarıyla eşleşmeli (veya hazırlık değilse hazırlıkla eşleşmemeli)
    if (qIsFriendly !== mIsFriendly) {
        item.similarityScore -= 20.0; // Çok ağır penaltı
    }
    
    // 2. Milli maçlar milli maçlarla eşleşmeli
    if (qIsNational !== mIsNational) {
        item.similarityScore -= 15.0; 
    }

    // Bağlamsal Bonuslar / Penaltılar
    if (qIsContinentalClub) {
      if (mIsContinentalClub) {
        item.similarityScore += 2.0;
      } else if (mContinent !== "UNKNOWN" && qContinent !== "UNKNOWN" && mContinent === qContinent) {
        item.similarityScore += 0.0;
      } else {
        item.similarityScore -= 5.0; 
      }
    } else if (qIsNational) {
      if (mContinent !== "UNKNOWN" && qContinent !== "UNKNOWN" && mContinent === qContinent) {
        item.similarityScore += 3.0;
      } else {
        item.similarityScore -= 2.0;
      }
    } else {
      // Yerel Ligler
      if (isTargetMatchSameCountry(mLig)) {
        item.similarityScore += 5.0; // Aynı ülke bonusu (scoreMatch'teki bonuslara ek olarak)
      } else if (mContinent !== "UNKNOWN" && qContinent !== "UNKNOWN" && mContinent === qContinent) {
        item.similarityScore += 1.5; // Aynı kıta bonusu
      } else {
        item.similarityScore -= 4.0; // Farklı kıta penaltısı (örn. Güney Amerika vs Avrupa)
      }
    }
    
    // Güvenlik sınırları
    item.similarityScore = Math.max(0.0, Math.min(100.0, item.similarityScore));
    results.push(item);
  }

  // Tüm maçları sırala
  results.sort((a, b) => b.similarityScore - a.similarityScore);

  const finalResults = query.strict100 ? results.filter(m => Math.round(m.similarityScore) === 100) : results.filter(m => m.similarityScore >= 80);
  const maxResults = query.strict100 ? Math.min(query.maxResults ?? 150, 150) : query.maxResults ?? 150;
  return finalResults.slice(0, maxResults);
}
"""

start_idx_find = content.find("  // Pre-score all matches")
end_idx_find = content.rfind("}") + 1
content = content[:start_idx_find] + find_logic

with codecs.open(path, 'w', 'utf-8') as f:
    f.write(content)

print("Patched similarity.ts for context logic!")
