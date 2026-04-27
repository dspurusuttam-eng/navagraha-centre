import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

type JsonRecord = { [key: string]: JsonValue };

function isRecord(value: JsonValue): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getType(value: JsonValue) {
  if (value === null) {
    return "null";
  }

  if (Array.isArray(value)) {
    return "array";
  }

  return typeof value;
}

function collectKeyTypes(source: JsonRecord, prefix = "", bucket = new Map<string, string>()) {
  for (const [key, value] of Object.entries(source)) {
    const keyPath = prefix ? `${prefix}.${key}` : key;
    bucket.set(keyPath, getType(value));

    if (isRecord(value)) {
      collectKeyTypes(value, keyPath, bucket);
    }
  }

  return bucket;
}

async function readJsonFile(filePath: string): Promise<JsonRecord> {
  const raw = await readFile(filePath, "utf-8");
  const parsed = JSON.parse(raw) as JsonValue;

  if (!isRecord(parsed)) {
    throw new Error("Expected root object");
  }

  return parsed;
}

async function main() {
  const messagesDirectory = path.resolve(process.cwd(), "src/messages");
  const basePath = path.join(messagesDirectory, "en.json");
  const baseDictionary = await readJsonFile(basePath);
  const baseMap = collectKeyTypes(baseDictionary);

  const messageFiles = (await readdir(messagesDirectory))
    .filter((fileName) => fileName.endsWith(".json") && fileName !== "en.json")
    .sort((a, b) => a.localeCompare(b));

  if (!messageFiles.length) {
    console.log("No locale message files found to validate.");
    return;
  }

  let hasIssues = false;

  for (const fileName of messageFiles) {
    const locale = fileName.replace(/\.json$/, "");
    const localePath = path.join(messagesDirectory, fileName);

    try {
      const localeDictionary = await readJsonFile(localePath);
      const localeMap = collectKeyTypes(localeDictionary);
      const missingKeys: string[] = [];
      const extraKeys: string[] = [];
      const typeMismatches: string[] = [];

      for (const [keyPath, expectedType] of baseMap.entries()) {
        const localeType = localeMap.get(keyPath);

        if (!localeType) {
          missingKeys.push(keyPath);
          continue;
        }

        if (localeType !== expectedType) {
          typeMismatches.push(`${keyPath} (expected ${expectedType}, found ${localeType})`);
        }
      }

      for (const keyPath of localeMap.keys()) {
        if (!baseMap.has(keyPath)) {
          extraKeys.push(keyPath);
        }
      }

      if (!missingKeys.length && !extraKeys.length && !typeMismatches.length) {
        console.log(`✔ ${locale}: key structure matches en.json`);
        continue;
      }

      hasIssues = true;
      console.log(`✘ ${locale}: key issues detected`);

      if (missingKeys.length) {
        console.log(`  Missing (${missingKeys.length}): ${missingKeys.join(", ")}`);
      }

      if (extraKeys.length) {
        console.log(`  Extra (${extraKeys.length}): ${extraKeys.join(", ")}`);
      }

      if (typeMismatches.length) {
        console.log(`  Type mismatches (${typeMismatches.length}): ${typeMismatches.join(", ")}`);
      }
    } catch (error) {
      hasIssues = true;
      const message = error instanceof Error ? error.message : String(error);
      console.log(`✘ ${locale}: invalid JSON or unreadable file (${message})`);
    }
  }

  if (hasIssues) {
    process.exitCode = 1;
    return;
  }

  console.log("All locale dictionaries passed key parity checks against en.json.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
