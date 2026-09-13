const fs = require("fs");
const path = require("path");

const fpath = path.join(__dirname, "..", "artifacts", "api-server", "src", "routes", "coupon.ts");
let code = fs.readFileSync(fpath, "utf-8");

code = code.replace(/Ma Sonucu 1/g, "Maç Sonucu 1");
code = code.replace(/Ma Sonucu X/g, "Maç Sonucu X");
code = code.replace(/Ma Sonucu 2/g, "Maç Sonucu 2");
code = code.replace(/2\.5 Gol ost/g, "2.5 Gol Üst");
code = code.replace(/KarYlkl Gol Var/g, "Karşılıklı Gol Var");
code = code.replace(/Y 0\.5 ost/g, "İY 0.5 Üst");
code = code.replace(/Y 1\.5 ost/g, "İY 1.5 Üst");
code = code.replace(/Kupon hesaplanrken hata oluYtu\./g, "Kupon hesaplanırken hata oluştu.");

fs.writeFileSync(fpath, code, "utf-8");
console.log("Turkish chars fixed!");

