import { chromium } from "playwright";
import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

(async () => {
  console.log("=========================================================");
  console.log(" Birebin Oturum Acma Sihirbazi (Playwright)");
  console.log("=========================================================");
  console.log("Bu islem tarayicisi acacak, hesabina giris yapacaksin.");
  console.log("Giris yaptiktan sonra çerezlerin kaydedilecek ve bot bunu kullanacak.\n");

  const browser = await chromium.launch({ headless: false });
  // Ozel profil veya gizli mod tarzi ayarlar, kalici session icin context kullaniyoruz.
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log("Tarayici aciliyor, lutfen Birebin.com uzerinde giris yapin...");
  await page.goto("https://www.birebin.com");

  rl.question("\n[ONAY] Hesabiniza basariyla giris yaptiysaniz ENTER tusuna basin...", async () => {
    // Cookie ve session stateleri kaydet
    await context.storageState({ path: "session.json" });
    console.log("✅ Basarili! Oturum bilgileri session.json dosyasina kaydedildi.");
    console.log("Artik bot.js dosyasini arka planda calistirabilirsin.");
    
    await browser.close();
    rl.close();
  });
})();
