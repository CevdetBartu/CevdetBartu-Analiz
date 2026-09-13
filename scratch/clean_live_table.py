import os
import re

fpath = 'artifacts/football-app/src/pages/LiveMatchesPage.tsx'
with open(fpath, 'r', encoding='utf-8') as f:
    code = f.read()

# I will replace the entire LIVE MATCHES TABLE section with a clean version identical to BULLETIN but with score
# The 'Bulletin Table View' logic is already clean and has MS ORANLARI and ALT / ÜST.
# Let's extract the Bulletin row rendering and use it for Live, but display m.skor instead of m.saat

# First, let's see how Live Matches tbody is rendered.

