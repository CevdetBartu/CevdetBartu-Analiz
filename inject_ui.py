import sys

file_path = 'artifacts/football-app/src/pages/TodayMatchesPage.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("import { SeoHead } from '../components/seo/SeoHead';", "import { SeoHead } from '../components/seo/SeoHead';\nimport { CouponWizard } from '../components/CouponWizard';")

old_header = '''      <div className="page-header" style={{ marginBottom: "2rem" }}>
        <h1 className="title">Bugünün Bülteni</h1>
        <p className="subtitle">{displayDate} - Tüm oranlı maçlar</p>
      </div>'''

new_header = old_header + '\n\n      <CouponWizard />\n'

content = content.replace(old_header, new_header)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Injected UI successfully!")
