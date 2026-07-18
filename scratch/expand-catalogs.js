import fs from "node:fs";
import path from "node:path";

// Let's write a simple parser for pnpm-workspace.yaml catalog section
const workspaceYamlPath = path.resolve("pnpm-workspace.yaml");
const yamlContent = fs.readFileSync(workspaceYamlPath, "utf-8");

// Parse catalog key-values using regex
const catalog = {};
let inCatalog = false;

for (const line of yamlContent.split("\n")) {
  const trimmed = line.trim();
  if (trimmed.startsWith("catalog:")) {
    inCatalog = true;
    continue;
  }
  if (inCatalog) {
    // If it's a new section, stop parsing catalog
    if (trimmed && !trimmed.startsWith("#") && !trimmed.includes(":") && !trimmed.startsWith("-")) {
      inCatalog = false;
      continue;
    }
    const match = trimmed.match(/^['"]?([^'":]+)['"]?\s*:\s*['"]?([^'"]+)['"]?$/);
    if (match) {
      catalog[match[1]] = match[2];
    }
  }
}

console.log("Found catalog definitions:", catalog);

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === "node_modules" || file === ".git" || file === ".venv") continue;
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDir(fullPath);
    } else if (file === "package.json") {
      let content = fs.readFileSync(fullPath, "utf-8");
      let pkg = JSON.parse(content);
      let changed = false;

      const keys = ["dependencies", "devDependencies", "peerDependencies"];
      for (const key of keys) {
        if (pkg[key]) {
          for (const dep in pkg[key]) {
            if (pkg[key][dep] === "catalog:") {
              if (catalog[dep]) {
                pkg[key][dep] = catalog[dep];
                changed = true;
                console.log(`Updated ${dep} in ${path.relative(process.cwd(), fullPath)} to ${catalog[dep]}`);
              } else {
                console.warn(`Warning: ${dep} has catalog: but not found in pnpm-workspace.yaml`);
              }
            }
          }
        }
      }

      if (changed) {
        fs.writeFileSync(fullPath, JSON.stringify(pkg, null, 2) + "\n", "utf-8");
      }
    }
  }
}

processDir(process.cwd());
console.log("Catalog expansion completed successfully!");
