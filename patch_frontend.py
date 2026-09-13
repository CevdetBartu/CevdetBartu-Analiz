import codecs
import re

path = 'artifacts/football-app/src/components/AnalysisTable.tsx'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

# Replace `{hasData && (` with just `(` for the main stats bar so it always renders, but add a warning message.
replacement = """
      {ozet.total_mac === 0 && (
        <div style={{ backgroundColor: '#fff3cd', color: '#856404', padding: '12px', borderRadius: '4px', marginBottom: '12px', border: '1px solid #ffeeba', fontSize: '14px' }}>
          <strong>⚠️ Yeterli Veri Bulunamadı:</strong> Bu maç için belirlenen bağlamsal ve oransal filtreleri (%80+ benzerlik) geçen geçmiş maç bulunamadı. Aşağıda gösterilen yüzdeler piyasa oranlarının saf matematiksel olasılığını (Implied Probability) yansıtmaktadır.
        </div>
      )}
      
      <div className="stats-bar">
"""

content = re.sub(r'\{hasData && \(\s*<div className="stats-bar">', replacement, content)

# There are other {hasData && ( instances. Let's find them.
with codecs.open(path, 'w', 'utf-8') as f:
    f.write(content)
print("Patched stats bar visibility!")
