const fs = require("fs");
const path = require("path");

const fpath = path.join(__dirname, "..", "artifacts", "football-app", "src", "components", "AnalysisTable.tsx");
let code = fs.readFileSync(fpath, "utf-8");

// Insert state and function
const stateInject = `  const { analiz_ozet: ozet, tahminler, tablo_satirlari } = analyzeResponse;
  const hasData = ozet.total_mac > 0;

  const [aiCommentary, setAiCommentary] = React.useState<string | null>(null);
  const [aiLoading, setAiLoading] = React.useState(false);
  const BASE = import.meta.env.BASE_URL.replace(/\\/$/, "");

  const generateAICommentary = async () => {
    setAiLoading(true);
    try {
      const res = await fetch(\`\${BASE}/api/ai/generate-commentary\`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
           matchData: { homeTeam, awayTeam, league },
           stats: ozet
        })
      });
      const data = await res.json();
      if (data.commentary) setAiCommentary(data.commentary);
      else alert(data.error || "Hata oluYtu.");
    } catch (e) {
       alert(e.message);
    } finally {
       setAiLoading(false);
    }
  };`;

code = code.replace(`  const { analiz_ozet: ozet, tahminler, tablo_satirlari } = analyzeResponse;
  const hasData = ozet.total_mac > 0;`, stateInject);

// Insert UI
const uiInject = `      {/* AI Commentary Section */}
      {hasData && (
        <div style={{ padding: "16px", backgroundColor: "#1e293b", borderBottom: "1px solid var(--border)" }}>
          {!aiCommentary ? (
             <button 
                onClick={generateAICommentary} 
                disabled={aiLoading}
                style={{
                  background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                  color: "#fff",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  cursor: aiLoading ? "wait" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}
             >
                {aiLoading ? "Yaziliyor..." : "✨ AI Tipster Analizi Olustur"}
             </button>
          ) : (
             <div style={{ padding: "16px", backgroundColor: "#0f172a", borderRadius: "8px", borderLeft: "4px solid #8b5cf6", position: "relative" }}>
                <span style={{ position: "absolute", top: "-10px", left: "12px", background: "#8b5cf6", color: "#fff", padding: "2px 8px", borderRadius: "12px", fontSize: "10px", fontWeight: "bold" }}>
                   AI TIPSTER YORUMU
                </span>
                <p style={{ margin: 0, color: "#f8fafc", fontSize: "14px", lineHeight: 1.6, fontStyle: "italic" }}>
                   "{aiCommentary}"
                </p>
             </div>
          )}
        </div>
      )}

      {/* Table Quick Filter Toolbar */}`;

code = code.replace(`      {/* "?"? Table Quick Filter Toolbar "?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"? */}
      <div className="table-filter-bar"`, uiInject + `\n      <div className="table-filter-bar"`);

fs.writeFileSync(fpath, code, "utf-8");
console.log("AnalysisTable updated with AI commentary UI!");

