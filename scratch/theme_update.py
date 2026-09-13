import re

fpath = "artifacts/football-app/src/index.css"
with open(fpath, "r", encoding="utf-8") as f:
    css = f.read()

# Update :root theme
new_root = """
:root {
  color-scheme: dark;
  --app-font-sans: 'Inter', 'Segoe UI', system-ui, sans-serif;
  --app-font-mono: Menlo, monospace;
  --radius: 0.375rem;

  /* Premium Slate/Zinc Dark Theme */
  --background: 222 47% 7%;  /* Slate 950 */
  --foreground: 210 40% 98%; /* Slate 50 */
  
  --card: 222 47% 9%;
  --card-foreground: 210 40% 98%;
  
  --popover: 222 47% 9%;
  --popover-foreground: 210 40% 98%;
  
  --border: 215 28% 17%; /* Slate 800 */
  --input: 215 28% 17%;
  
  --primary: 158 64% 52%; /* Emerald 400 for a pro green accent */
  --primary-foreground: 152 76% 12%;
  
  --secondary: 217 33% 17%;
  --secondary-foreground: 210 40% 98%;
  
  --muted: 217 33% 17%;
  --muted-foreground: 215 20% 65%;
  
  --accent: 217 33% 17%;
  --accent-foreground: 210 40% 98%;
  
  --destructive: 0 84% 60%;
  --destructive-foreground: 210 40% 98%;

  --ring: 158 64% 52%;
"""
css = re.sub(r':root\s*\{[^}]+\}', new_root + "}", css, count=1)

# Remove glowing effects
css = re.sub(r'box-shadow:\s*0\s*0\s*[0-9px\s]+rgba[^;]+;', "", css)
css = re.sub(r'text-shadow:\s*[^;]+;', "", css)
css = re.sub(r'filter:\s*drop-shadow[^;]+;', "", css)

# Make table cleaner
css = css.replace("border-left: 1px solid #1e2632;", "")
css = css.replace("border-right: 1px solid #1e2632;", "")
css = css.replace("outline: 2px solid #2a5a8f;", "border-left: 3px solid hsl(var(--primary));")
css = css.replace("background: #0d1117;", "background: transparent;")

with open(fpath, "w", encoding="utf-8") as f:
    f.write(css)
print("Updated CSS Theme!")

