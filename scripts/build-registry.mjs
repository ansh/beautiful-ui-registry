#!/usr/bin/env node
// Expands registry.json into the flat, self-contained item files the shadcn
// CLI fetches: public/r/<name>.json, plus a public/r/registry.json index.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "r");

// BASE_URL lets the same source build against localhost, chorus.host, or
// beautifului.dev without editing registry.json.
const baseUrl = (process.env.BASE_URL ?? "https://beautiful-ui.chorus.host").replace(/\/$/, "");

const registry = JSON.parse(readFileSync(join(root, "registry.json"), "utf8"));

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

const index = [];

for (const item of registry.items) {
  const files = item.files.map((file) => ({
    path: file.path,
    type: file.type,
    target: file.target,
    content: readFileSync(join(root, file.path), "utf8"),
  }));

  // registryDependencies must be absolute URLs for a third-party registry —
  // a bare name would resolve against ui.shadcn.com instead of this host.
  const registryDependencies = (item.registryDependencies ?? []).map((dep) =>
    dep.startsWith("http") ? dep : `${baseUrl}/r/${dep}.json`,
  );

  const built = {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: item.name,
    type: item.type,
    title: item.title,
    description: item.description,
    author: "Shane Levine <https://www.beautifului.dev>",
    ...(item.dependencies ? { dependencies: item.dependencies } : {}),
    ...(registryDependencies.length ? { registryDependencies } : {}),
    files,
  };

  writeFileSync(join(outDir, `${item.name}.json`), JSON.stringify(built, null, 2));

  index.push({
    name: item.name,
    type: item.type,
    title: item.title,
    description: item.description,
    url: `${baseUrl}/r/${item.name}.json`,
    add: `npx shadcn@latest add ${baseUrl}/r/${item.name}.json`,
  });
}

writeFileSync(
  join(outDir, "registry.json"),
  JSON.stringify(
    {
      $schema: "https://ui.shadcn.com/schema/registry.json",
      name: registry.name,
      homepage: registry.homepage,
      baseUrl,
      items: index,
    },
    null,
    2,
  ),
);

console.log(`built ${index.length} items -> public/r (base ${baseUrl})`);
for (const name of readdirSync(outDir).sort()) console.log("  r/" + name);
