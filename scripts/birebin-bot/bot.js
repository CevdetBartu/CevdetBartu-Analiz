import { chromium } from "playwright";
import fs from "fs";
import readlineSync from "readline-sync";

const delay = (ms) => new Promise(res => setTimeout(res, ms));

async function getMatchDataFromBackend(searchTerm) {
    try {
        console.log(`\n📡 Yerel veritabanında '${searchTerm}' aranıyor...`);
        const todayRes = await fetch("http://localhost:8080/api/today-matches");
        if (!todayRes.ok) throw new Error("API sunucusuna ulaşılamadı (today-matches).");
        const todayData = await todayRes.json();
        const matches = todayData.matches || [];

        const targetMatch = matches.find(m => 
            m.ev_sahibi.toLowerCase().includes(searchTerm.toLowerCase()) || 
            m.deplasman.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (!targetMatch) {
            console.log(`❌ HATA: '${searchTerm}' bugün oynanacak maçlar arasında bulunamadı.`);
            return null;
        }

        console.log(`✅ Eşleşme bulundu: ${targetMatch.ev_sahibi} vs ${targetMatch.deplasman}`);
        
        console.log("🔍 Benzer maçlar aranıyor (Yapay zeka için veriler hazırlanıyor)...");
        const simRes = await fetch("http://localhost:8080/api/matches/find-similar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                oddsHome: targetMatch.oran_1,
                oddsDraw: targetMatch.oran_x,
                oddsAway: targetMatch.oran_2,
                altOdds: targetMatch.alt_orani,
                ustOdds: targetMatch.ust_orani,
                varOdds: targetMatch.kg_var,
                yokOdds: targetMatch.kg_yok,
                altOdds35: targetMatch.alt_orani_35,
                ustOdds35: targetMatch.ust_orani_35,
                iyAltOdds15: targetMatch.iy_alt_orani_15,
                iyUstOdds15: targetMatch.iy_ust_orani_15,
                iyAltOdds05: targetMatch.iy_alt_orani_05,
                iyUstOdds05: targetMatch.iy_ust_orani_05,
            })
        });
        const refMatches = await simRes.json();

        console.log(`📊 Oran ağırlıklı analiz hesaplanıyor...`);
        const analyzeRes = await fetch("http://localhost:8080/api/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                targetMatch,
                referenceMatches: refMatches
            })
        });
        const analyzeData = await analyzeRes.json();

        console.log(`🤖 Gemini AI Tipster'a bağlanılıyor...`);
        const aiRes = await fetch("http://localhost:8080/api/ai/generate-commentary", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                matchData: { homeTeam: targetMatch.ev_sahibi, awayTeam: targetMatch.deplasman, league: targetMatch.lig },
                stats: analyzeData.analiz_ozet
            })
        });
        const aiData = await aiRes.json();
        
        if (aiData.commentary) {
            console.log(`\n💬 AI Yorumu Hazır:\n"${aiData.commentary}"\n`);
            return aiData.commentary;
        } else {
            throw new Error("Yorum üretilemedi.");
        }
    } catch (e) {
        console.error("Yapay Zeka hatası:", e.message);
        return null;
    }
}

(async () => {
  if (!fs.existsSync("session.json")) {
    console.error("HATA: session.json bulunamadı. Önce 'node login.js' çalıştırın.");
    process.exit(1);
  }

  console.log("=========================================================");
  console.log(" 🤖 Birebin OTONOM YZ Tipster Botu (v2 - YARI-MANUEL)");
  console.log("=========================================================");

  while (true) {
      console.log("\n---------------------------------------------------------");
      const searchTerm = readlineSync.question('Yorum yazilacak takimin adini yazin (Cikmak icin Q): ');
      
      if (searchTerm.toLowerCase() === 'q') {
          console.log("Çıkış yapılıyor...");
          break;
      }
      
      if (!searchTerm || searchTerm.length < 3) {
          console.log("Lütfen en az 3 harfli bir kelime girin.");
          continue;
      }

      const geminiYorumu = await getMatchDataFromBackend(searchTerm.trim());
      if (!geminiYorumu) continue;

      const onay = readlineSync.question("Bu yorumu Birebin'e aktarmak istiyor musunuz? (E/H): ");
      if (onay.toLowerCase() !== 'e') {
          console.log("Atlandı.");
          continue;
      }

      console.log("Birebin açılıyor, lütfen bekleyin...");
      const browser = await chromium.launch({ headless: false }); 
      const context = await browser.newContext({ storageState: "session.json" });
      const page = await context.newPage();

      try {
        await page.goto("https://www.birebin.com/iddaa-programi-futbol?GroupType=date", { waitUntil: "domcontentloaded", timeout: 60000 });
        
        console.log("Arama yapılıyor...");
        await delay(3000);

        // Pop-upları kapat
        const tamamBtn = page.locator('button:has-text("TAMAM"), a:has-text("TAMAM")').first();
        if (await tamamBtn.isVisible().catch(()=>false)) {
            await tamamBtn.click({ force: true }).catch(()=>null);
        }

        // CTRL+F gibi sayfa içi arama simülasyonu
        const hedeflenenSatir = page.locator(`text="${searchTerm}"`).first();
        
        if (await hedeflenenSatir.isVisible({ timeout: 5000 }).catch(() => false)) {
            console.log("✅ Maç Birebin'de bulundu! Tıklanıyor...");
            await hedeflenenSatir.click({ force: true });
            await delay(3000);
            
            console.log("'Kupon/Yorum' sekmesi aranıyor...");
            const yorumSekmesi = page.locator('text="Kupon/Yorum"').first();
            
            if (await yorumSekmesi.isVisible({ timeout: 5000 }).catch(() => false)) {
                await yorumSekmesi.click({ force: true });
                await delay(2000);
                
                console.log("Analiz metin kutusuna Gemini'nin yorumu yazılıyor...");
                const textarea = page.locator('textarea').first();
                await textarea.click({ force: true });
                await textarea.fill(geminiYorumu);
                await delay(2000);
                
                console.log("🎉 YAZIM İŞLEMİ TAMAMLANDI!");
                console.log("⚠️ Tahmin (oran) seçimini ve 'GÖNDER' butonuna basma işlemini tarayıcıdan SİZ YAPIN.");
                
                readlineSync.question("Gönderdikten sonra devam etmek için ENTER'a basın...");
            } else {
                console.log("❌ HATA: 'Kupon/Yorum' sekmesi bulunamadı! Sayfa düzeni farklı olabilir.");
            }
        } else {
            console.log("❌ HATA: Bu takım Birebin ekranında bulunamadı! Yazımı kontrol edin.");
        }

      } catch (error) {
        console.error("\n❌ Bot çalışırken bir hata oluştu:", error.message);
      } finally {
        await browser.close();
      }
  }
})();
