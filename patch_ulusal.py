import codecs
import re

path = 'artifacts/api-server/src/lib/similarity.ts'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

old_logic = """  const isTargetMatchSameCountry = (mLig: string) => {
    if (targetCountrySynonyms.length > 0) {
      return targetCountrySynonyms.some(syn => mLig.startsWith(syn) || mLig.includes(syn));
    }
    return qLig === mLig || qLig.includes(mLig) || mLig.includes(qLig);
  };"""

new_logic = """  const isTargetMatchSameCountry = (mLig: string) => {
    if (targetCountrySynonyms.length > 0) {
      return targetCountrySynonyms.some(syn => {
        const regex = new RegExp(`\\\\b${syn}\\\\b`, 'i');
        return regex.test(mLig);
      });
    }
    return qLig === mLig || qLig.includes(mLig) || mLig.includes(qLig);
  };"""

if old_logic in content:
    content = content.replace(old_logic, new_logic)
    with codecs.open(path, 'w', 'utf-8') as f:
        f.write(content)
    print("Patched ulusal bug!")
else:
    print("Could not find logic to patch!")
