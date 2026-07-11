import { copyFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const masterPath = path.join(
  repoRoot,
  "public",
  "brand",
  "navagraha-centre-logo-master.png"
);
const brandOutputDir = path.join(repoRoot, "public", "brand");
const outputDir = path.join(repoRoot, "public");
const appIconPath = path.join(repoRoot, "src", "app", "icon.png");

const logoSizes = [2048, 1024, 512, 256, 192, 180, 128, 96, 64, 48, 32, 16];
const rootIconSizes = [2048, 1024, 512, 256, 192, 180, 128, 96, 64, 48, 32, 16];
const appleIconSize = 180;
const faviconSizes = [16, 32, 48];
const maskableIconSize = 512;

function createIcoFromPngBuffers(pngBuffers, sizes) {
  const count = pngBuffers.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);

  const dirEntries = Buffer.alloc(count * 16);
  let offset = 6 + count * 16;

  pngBuffers.forEach((buffer, index) => {
    const size = sizes[index];
    const base = index * 16;

    dirEntries.writeUInt8(size >= 256 ? 0 : size, base + 0);
    dirEntries.writeUInt8(size >= 256 ? 0 : size, base + 1);
    dirEntries.writeUInt8(0, base + 2);
    dirEntries.writeUInt8(0, base + 3);
    dirEntries.writeUInt16LE(1, base + 4);
    dirEntries.writeUInt16LE(32, base + 6);
    dirEntries.writeUInt32LE(buffer.length, base + 8);
    dirEntries.writeUInt32LE(offset, base + 12);

    offset += buffer.length;
  });

  return Buffer.concat([header, dirEntries, ...pngBuffers]);
}

async function renderPng(size) {
  return sharp(masterPath)
    .resize(size, size, {
      fit: "contain",
      kernel: sharp.kernel.lanczos3,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .png({
      compressionLevel: 9,
      adaptiveFiltering: true,
    })
    .toBuffer();
}

async function renderMaskablePng(size) {
  const safeLogoSize = Math.round(size * 0.82);

  return sharp(masterPath)
    .resize(safeLogoSize, safeLogoSize, {
      fit: "contain",
      kernel: sharp.kernel.lanczos3,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .extend({
      top: Math.floor((size - safeLogoSize) / 2),
      bottom: Math.ceil((size - safeLogoSize) / 2),
      left: Math.floor((size - safeLogoSize) / 2),
      right: Math.ceil((size - safeLogoSize) / 2),
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .png({
      compressionLevel: 9,
      adaptiveFiltering: true,
    })
    .toBuffer();
}

async function run() {
  await mkdir(brandOutputDir, { recursive: true });
  await mkdir(outputDir, { recursive: true });

  for (const size of logoSizes) {
    const pngBuffer = await renderPng(size);
    await writeFile(
      path.join(brandOutputDir, `navagraha-centre-logo-${size}.png`),
      pngBuffer
    );
  }

  for (const size of rootIconSizes) {
    const pngBuffer = await renderPng(size);
    await writeFile(path.join(outputDir, `icon-${size}.png`), pngBuffer);
  }

  const appleBuffer = await renderPng(appleIconSize);
  await writeFile(path.join(outputDir, "apple-touch-icon.png"), appleBuffer);

  const maskableBuffer = await renderMaskablePng(maskableIconSize);
  await writeFile(
    path.join(outputDir, `icon-maskable-${maskableIconSize}.png`),
    maskableBuffer
  );

  await copyFile(path.join(outputDir, "icon-512.png"), appIconPath);

  const faviconPngs = await Promise.all(faviconSizes.map((size) => renderPng(size)));
  const faviconIco = createIcoFromPngBuffers(faviconPngs, faviconSizes);
  await writeFile(path.join(outputDir, "favicon.ico"), faviconIco);
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
