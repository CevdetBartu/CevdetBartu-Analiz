import codecs
import re

path = 'artifacts/api-server/src/lib/similarity.ts'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

# 1. Update ScoreBreakdown
content = content.replace(
    "export interface ScoreBreakdown {\n  oddsScore: number;\n  leagueScore: number;\n  cardScore: number;\n}",
    "export interface ScoreBreakdown {\n  oddsScore: number;\n  leagueScore: number;\n  cardScore: number;\n  rawScore?: number;\n  contextBonus?: number;\n}"
)

# 2. Update findSimilarMatches logic
old_logic = """
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
"""

new_logic = """
    let rawScore = item.similarityScore;
    let bonus = 0;

    // Yüksek öncelikli kurallar
    // 1. Hazırlık maçları SADECE hazırlık maçlarıyla eşleşmeli (veya hazırlık değilse hazırlıkla eşleşmemeli)
    if (qIsFriendly !== mIsFriendly) {
        bonus -= 20.0; // Çok ağır penaltı
    }
    
    // 2. Milli maçlar milli maçlarla eşleşmeli
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
    item.scoreBreakdown.rawScore = rawScore;
    item.scoreBreakdown.contextBonus = bonus;
"""

if "item.similarityScore -= 20.0;" in content:
    content = content.replace(old_logic, new_logic)
    with codecs.open(path, 'w', 'utf-8') as f:
        f.write(content)
    print("Patched similarity.ts for rawScore tracking!")
else:
    print("Failed to find logic block")
