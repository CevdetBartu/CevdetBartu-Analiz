const fs = require("fs");
const path = require("path");

const fpath = path.join(__dirname, "..", "artifacts", "football-app", "src", "pages", "Home.tsx");
let code = fs.readFileSync(fpath, "utf-8");

code = code.replace(`import { MatchInputForm } from \x27../components/MatchInputForm\x27;`, `import { DailyCouponWidget } from \x27../components/DailyCouponWidget\x27;`);

const pattern = /<div className="max-w-2xl mx-auto" style=\{\{ marginTop: \x2740px\x27 \}\}>.*?<\/main>/s;
const replacement = `<div style={{ marginTop: "40px", marginBottom: "40px", maxWidth: "600px", marginLeft: "auto", marginRight: "auto" }}>
            <DailyCouponWidget />
          </div>
        </main>`;

if (pattern.test(code)) {
    code = code.replace(pattern, replacement);
    fs.writeFileSync(fpath, code, "utf-8");
    console.log("Home.tsx successfully updated!");
} else {
    console.log("Could not find the target HTML block.");
}

