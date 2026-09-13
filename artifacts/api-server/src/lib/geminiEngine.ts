import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from "./logger";

function getAvailableKeys(): string[] {
  const keys: string[] = [];
  if (process.env.GEMINI_API_KEY) keys.push(process.env.GEMINI_API_KEY);
  for (let i = 1; i <= 20; i++) {
    const k = process.env[`GEMINI_API_KEY${i}`];
    if (k) keys.push(k);
  }
  return keys;
}

export async function generateHumanTipsterCommentary(matchData: any, stats: any): Promise<string> {
  const keys = getAvailableKeys();
  if (keys.length === 0) {
    throw new Error("Gemini API key is not configured in .env file.");
  }

  // En yüksek yüzdeli tahmini buluyoruz
  const oranlar = [
    { isim: "Ev Sahibi (MS1)", deger: parseFloat(stats.ev_sahibi?.yuzde || 0) },
    { isim: "Beraberlik (MSX)", deger: parseFloat(stats.beraberlik?.yuzde || 0) },
    { isim: "Deplasman (MS2)", deger: parseFloat(stats.deplasman?.yuzde || 0) },
    { isim: "2.5 Üst", deger: parseFloat(stats.ust_25?.yuzde || 0) },
    { isim: "Karşılıklı Gol Var (KG Var)", deger: parseFloat(stats.kg_var?.yuzde || 0) }
  ];
  oranlar.sort((a, b) => b.deger - a.deger);
  const enIyiTahmin = oranlar[0];

  const systemInstruction = `Sen yılların deneyimine sahip, Türkiye'nin en iyi profesyonel İddaa/Bahis analisti ve tipster'ısın.
Kesinlikle yapay zeka olduğunu belli etme. "Veritabanımıza göre", "Yapay zeka analizimiz", "Özetle", "Sonuç olarak", "Hesaplamalara göre" gibi robotik/akademik kelimeleri ASLA kullanma.
İddaa jargonunu kullan: "Taraf bahsi riskli", "Gollere yönelmek daha mantıklı", "Oran/risk dengesi harika", "Savunma zaafları göze çarpıyor", "Ev sahibi oyunu forse eder" vb.
Kısa, net ve güven veren bir dil kullan (Max 3-4 cümle).
ÖNEMLİ KURAL 1: Takımların gerçek hayattaki isim büyüklüklerine (Örn: PSG, Real Madrid vb.) ASLA aldanma! Sadece sana verilen istatistik yüzdelerine odaklan.
ÖNEMLİ KURAL 2: Profesyonel bir iddaa yazarı ASLA "banko", "garanti", "yüzde yüz", "kesin" gibi amatör kelimeler kullanmaz. Bu kelimeleri ASLA kullanma! Bunun yerine "en mantıklı tercih", "oran/risk açısından değerli", "ağır basan ihtimal", "ideal yönelim" gibi uzman bahisçi tavsiyeleri kullan.
Verilere göre en yüksek ihtimalli olan "${enIyiTahmin.isim}" (%${enIyiTahmin.deger}) tahminini kurgunun merkezine alarak analizini tamamla.`;

  const prompt = `
Maç: ${matchData.homeTeam} vs ${matchData.awayTeam}
Lig: ${matchData.league}
Benzer Geçmiş Maç Sayısı: ${stats.total_mac}

En Yüksek Güvenli Çıktılar:
- Ev Sahibi (MS1): %${stats.ev_sahibi?.yuzde}
- Beraberlik (MSX): %${stats.beraberlik?.yuzde}
- Deplasman (MS2): %${stats.deplasman?.yuzde}
- 2.5 Gol Üstü: %${stats.ust_25?.yuzde}
- Karşılıklı Gol Var: %${stats.kg_var?.yuzde}
- İlk Yarı 1.5 Üst: %${stats.iy_ust_15?.yuzde}

Lütfen bu verilere bakarak yukarıda belirtilen profesyonel tipster tarzıyla, iddialı ve kısa bir analiz metni yaz. Sadece maç yorumunu yaz, başlık veya selamlama kullanma.
`;

  let lastError: any = null;

  // Kota dolduğunda diğer key'e geçmek için döngü (API Key Rotator)
  for (let i = 0; i < keys.length; i++) {
    try {
      const genAI = new GoogleGenerativeAI(keys[i]);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-3.6-flash",
        systemInstruction
      });
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      logger.warn({ err: error, keyIndex: i }, `Gemini API key (Index ${i}) failed. Trying next if available.`);
      lastError = error;
      // Hata alınırsa döngü devam edecek ve bir sonraki API key denenecek
    }
  }

  logger.error({ err: lastError }, "All Gemini API keys failed.");
  throw new Error("Yorum oluşturulurken bir hata meydana geldi (Tüm API kotaları dolu olabilir).");
}

export async function generateSEOBlogPost(matchData: any, stats: any): Promise<{ title: string, content: string, excerpt: string, slug: string, category: string, read_time: string }> {
  const keys = getAvailableKeys();
  if (keys.length === 0) throw new Error('Gemini API key is not configured.');
  
  const oranlar = [
    { isim: 'Ev Sahibi (MS1)', deger: parseFloat(stats.ev_sahibi?.yuzde || 0) },
    { isim: 'Beraberlik (MSX)', deger: parseFloat(stats.beraberlik?.yuzde || 0) },
    { isim: 'Deplasman (MS2)', deger: parseFloat(stats.deplasman?.yuzde || 0) },
    { isim: '2.5 Üst', deger: parseFloat(stats.ust_25?.yuzde || 0) },
    { isim: 'Karşılıklı Gol Var (KG Var)', deger: parseFloat(stats.kg_var?.yuzde || 0) }
  ];
  oranlar.sort((a, b) => b.deger - a.deger);
  const enIyiTahmin = oranlar[0];

  const systemInstruction = `Sen uzman bir Spor Editörü, Teknik SEO Uzmanı ve Profesyonel İddaa Analistisin. 
Senden beklenen, verilen maç ve istatistik bilgilerine göre Google'da üst sıralara çıkacak bir blog post içeriği üretmen.
MUTLAKA JSON FORMATINDA (sadece JSON) GERİ DÖNÜŞ YAP.
Format:
{
  "title": "SEO uyumlu, 50-60 karakter, tıklama teşvik edici bir başlık (Örn: Galatasaray - Fenerbahçe Dev Derbi Analizi ve İddaa Tahmini)",
  "slug": "seo-uyumlu-turkce-karaktersiz-ve-kucuk-harfli-url-slugu",
  "category": "Lig adının SEO uyumlu url formatı (örn: turkiye-super-lig, ingiltere-premier-lig)",
  "excerpt": "140-160 karakterlik meta description ve özet. Anahtar kelimeleri içermeli.",
  "read_time": "Tahmini okuma süresi, (Örn: '3 dk okuma')",
  "content": "Makalenin tamamı. HTML (p, h2, ul, li vb.) kullanarak zengin bir SEO blog içeriği oluştur. En az 2-3 paragraf olsun. Analizde banko vs deme profesyonel kelimeler kullan. Önerilen tahmini (${enIyiTahmin.isim}) makale sonunda vurgulayarak belirt."
}`;

  const prompt = `
Maç: ${matchData.homeTeam} vs ${matchData.awayTeam}
Lig: ${matchData.league}
Benzer Geçmiş Maç Sayısı: ${stats.total_mac}

En Yüksek Güvenli Çıktılar:
- Ev Sahibi (MS1): %${stats.ev_sahibi?.yuzde}
- Beraberlik (MSX): %${stats.beraberlik?.yuzde}
- Deplasman (MS2): %${stats.deplasman?.yuzde}
- 2.5 Gol Üstü: %${stats.ust_25?.yuzde}
- Karşılıklı Gol Var: %${stats.kg_var?.yuzde}

Lütfen bu verilerle JSON tipinde blog yazısını üret.
`;

  let lastError: any = null;
  for (let i = 0; i < keys.length; i++) {
    try {
      const genAI = new GoogleGenerativeAI(keys[i]);
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-3.6-flash',
        systemInstruction,
        generationConfig: { responseMimeType: 'application/json' }
      });
      const result = await model.generateContent(prompt);
      const text = (await result.response).text();
      return JSON.parse(text);
    } catch (error: any) {
      logger.warn({ err: error, keyIndex: i }, 'Gemini API key failed.');
      lastError = error;
    }
  }
  logger.error({ err: lastError }, 'All Gemini API keys failed.');
  throw new Error('Blog oluşturulurken bir hata meydana geldi.');
}
