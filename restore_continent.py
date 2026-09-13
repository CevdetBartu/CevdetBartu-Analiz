import codecs

path = 'artifacts/api-server/src/lib/similarity.ts'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

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

content = content.replace("export function isNationalTeamMatch", continent_logic + "\nexport function isNationalTeamMatch")

with codecs.open(path, 'w', 'utf-8') as f:
    f.write(content)
print("Restored getLeagueContinent!")
