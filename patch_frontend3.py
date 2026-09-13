import codecs

path = 'artifacts/football-app/src/components/AnalysisTable.tsx'
with codecs.open(path, 'r', 'utf-8') as f:
    lines = f.read().split('\n')

# Line 156 (index 155) has `)}`
if lines[155].strip() == ')}':
    del lines[155]
else:
    for i, line in enumerate(lines):
        if line.strip() == ')}' and 'Model & Calibration Panel' in (lines[i+2] if i+2 < len(lines) else ''):
            del lines[i]
            break

with codecs.open(path, 'w', 'utf-8') as f:
    f.write('\n'.join(lines))
print("Removed stray )}")
