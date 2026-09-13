import codecs

path = 'artifacts/api-server/src/lib/similarity.ts'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

missing_funcs = """
export function isNationalTeamMatch(leagueName?: string | null): boolean {
  if (!leagueName) return false;
  const norm = leagueName.toLowerCase();
  return norm.includes("world cup") || 
         norm.includes("dünya kupası") || 
         norm.includes("nations league") || 
         norm.includes("euro ") || 
         norm.includes("avrupa şampiyonası") || 
         norm.includes("copa america") || 
         norm.includes("olimpiyat") || 
         norm.includes("olympic") ||
         norm.includes("africa cup") ||
         norm.includes("asian cup");
}

export function isContinentalClubMatch(leagueName?: string | null): boolean {
  if (!leagueName) return false;
  const norm = leagueName.toLowerCase();
  if (isNationalTeamMatch(leagueName)) return false;
  return norm.includes("champions league") || 
         norm.includes("şampiyonlar ligi") ||
         norm.includes("europa") || 
         norm.includes("avrupa ligi") ||
         norm.includes("conference") ||
         norm.includes("konferans") ||
         norm.includes("libertadores") || 
         norm.includes("sudamericana") ||
         norm.includes("afc champions") ||
         norm.includes("caf champions");
}
"""

content = content.replace("export function findSimilarMatches(", missing_funcs + "\nexport function findSimilarMatches(")

with codecs.open(path, 'w', 'utf-8') as f:
    f.write(content)
print("Restored missing functions!")
