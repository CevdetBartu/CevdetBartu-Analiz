import codecs

path = 'artifacts/football-app/src/components/AnalysisTable.tsx'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

# Block 1
t1 = """      {/* Model & Calibration Panel */}
      {hasData && (
        <div style="""
r1 = """      {/* Model & Calibration Panel */}
        <div style="""

content = content.replace(t1, r1)

# Block 2
t2 = """          </div>
        </div>
      )}

      {/* AI Commentary Section */}"""
r2 = """          </div>
        </div>

      {/* AI Commentary Section */}"""
content = content.replace(t2, r2)

# Block 3
t3 = """      {/* AI Commentary Section */}
      {hasData && (
        <div style={{ padding: "16px","""
r3 = """      {/* AI Commentary Section */}
        <div style={{ padding: "16px","""
content = content.replace(t3, r3)

# Block 4
t4 = """          )}
        </div>
      )}

      {/* Quick Filters */}"""
r4 = """          )}
        </div>

      {/* Quick Filters */}"""
content = content.replace(t4, r4)


with codecs.open(path, 'w', 'utf-8') as f:
    f.write(content)
print("Removed remaining hasData blocks!")
