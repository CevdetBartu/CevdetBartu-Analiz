const fs = require("fs");
const path = require("path");

const fpath = path.join(__dirname, "..", "artifacts", "api-server", "src", "routes", "coupon.ts");
let code = fs.readFileSync(fpath, "utf-8");

const lines = code.split("\n");
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("checkPred(ozet.ev_sahibi")) lines[i] = "      checkPred(ozet.ev_sahibi, \"Maç Sonucu 1\");";
    if (lines[i].includes("checkPred(ozet.beraberlik")) lines[i] = "      checkPred(ozet.beraberlik, \"Maç Sonucu X\");";
    if (lines[i].includes("checkPred(ozet.deplasman")) lines[i] = "      checkPred(ozet.deplasman, \"Maç Sonucu 2\");";
    if (lines[i].includes("checkPred(ozet.ust_25")) lines[i] = "      checkPred(ozet.ust_25, \"2.5 Gol Üst\");";
    if (lines[i].includes("checkPred(ozet.kg_var")) lines[i] = "      checkPred(ozet.kg_var, \"Karşılıklı Gol Var\");";
    if (lines[i].includes("checkPred(ozet.iy_ust_05")) lines[i] = "      checkPred(ozet.iy_ust_05, \"İY 0.5 Üst\");";
    if (lines[i].includes("checkPred(ozet.iy_ust_15")) lines[i] = "      checkPred(ozet.iy_ust_15, \"İY 1.5 Üst\");";
    if (lines[i].includes("res.status(500).json")) lines[i] = "    res.status(500).json({ error: \"Kupon hesaplanırken hata oluştu.\" });";
}

fs.writeFileSync(fpath, lines.join("\n"), "utf-8");
console.log("Turkish chars replaced completely!");

