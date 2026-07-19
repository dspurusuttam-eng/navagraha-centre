/**
 * Desk cover-image upload QA (pure; no network, no DB).
 * Pins the security rules that decide what may reach durable storage: size ceiling,
 * MIME allow-list, magic-byte sniffing (renamed executables / SVG payloads), declared-vs-real
 * type agreement, collision-safe keys and path-traversal-proof display filenames.
 * Also statically asserts the route + UI wiring (auth guard, accept attribute, no capture).
 */
import { readFileSync } from "node:fs";
import {
  MAX_UPLOAD_BYTES,
  UPLOADABLE_IMAGE_MIME_TYPES,
  UPLOAD_ACCEPT_ATTRIBUTE,
  buildUploadObjectKey,
  isUploadableImageMimeType,
  sniffImageMimeType,
  toSafeDisplayFilename,
  validateUpload,
} from "@/modules/admin/media/upload-core";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
const read = (path: string): string => readFileSync(path, "utf8");

const jpeg = (extra = 16) => new Uint8Array([0xff, 0xd8, 0xff, 0xe0, ...Array(extra).fill(0x00)]);
const png = (extra = 16) =>
  new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, ...Array(extra).fill(0x00)]);
const webp = () =>
  new Uint8Array([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50, 0, 0, 0, 0]);
const svg = () => new Uint8Array([...Buffer.from("<svg xmlns=\"http://www.w3.org/2000/svg\">")]);
const exe = () => new Uint8Array([0x4d, 0x5a, 0x90, 0x00, ...Array(16).fill(0x00)]); // MZ header

type Group = { name: string; run: () => void };
const groups: Group[] = [
  {
    name: "TYPES: only JPEG/PNG/WebP are uploadable; SVG is excluded",
    run: () => {
      assert(UPLOADABLE_IMAGE_MIME_TYPES.length === 3, "exactly three uploadable types");
      for (const type of ["image/jpeg", "image/png", "image/webp"]) {
        assert(isUploadableImageMimeType(type), `${type} allowed`);
      }
      for (const type of ["image/svg+xml", "image/gif", "text/html", "application/pdf", "", null]) {
        assert(!isUploadableImageMimeType(type), `${String(type)} rejected`);
      }
      assert(!UPLOAD_ACCEPT_ATTRIBUTE.includes("svg"), "accept attribute excludes SVG");
      assert(UPLOAD_ACCEPT_ATTRIBUTE === "image/jpeg,image/png,image/webp", "accept attribute exact");
    },
  },
  {
    name: "SNIFF: real content type is detected from magic bytes",
    run: () => {
      assert(sniffImageMimeType(jpeg()) === "image/jpeg", "jpeg sniffed");
      assert(sniffImageMimeType(png()) === "image/png", "png sniffed");
      assert(sniffImageMimeType(webp()) === "image/webp", "webp sniffed");
      assert(sniffImageMimeType(svg()) === null, "svg not a valid upload");
      assert(sniffImageMimeType(exe()) === null, "executable not a valid upload");
      assert(sniffImageMimeType(new Uint8Array([0xff, 0xd8])) === null, "truncated file rejected");
    },
  },
  {
    name: "VALIDATE: size ceiling enforced at 8 MB",
    run: () => {
      assert(MAX_UPLOAD_BYTES === 8 * 1024 * 1024, "8 MB ceiling");
      const over = validateUpload({
        declaredMimeType: "image/jpeg",
        byteSize: MAX_UPLOAD_BYTES + 1,
        bytes: jpeg(),
        filename: "big.jpg",
      });
      assert(!over.ok && over.code === "FILE_TOO_LARGE", "oversized rejected");
      const empty = validateUpload({ declaredMimeType: "image/jpeg", byteSize: 0, bytes: jpeg(), filename: "x.jpg" });
      assert(!empty.ok && empty.code === "EMPTY_FILE", "empty rejected");
      const ok = validateUpload({
        declaredMimeType: "image/jpeg",
        byteSize: MAX_UPLOAD_BYTES,
        bytes: jpeg(),
        filename: "ok.jpg",
      });
      assert(ok.ok, "exactly-at-limit accepted");
    },
  },
  {
    name: "VALIDATE: renamed / mismatched / unsupported files are rejected",
    run: () => {
      const renamedExe = validateUpload({
        declaredMimeType: "image/png",
        byteSize: 20,
        bytes: exe(),
        filename: "payload.png",
      });
      assert(!renamedExe.ok && renamedExe.code === "MALFORMED_IMAGE", "renamed executable rejected");

      const svgUpload = validateUpload({
        declaredMimeType: "image/svg+xml",
        byteSize: 40,
        bytes: svg(),
        filename: "logo.svg",
      });
      assert(!svgUpload.ok && svgUpload.code === "UNSUPPORTED_TYPE", "svg rejected by type gate");

      const mismatch = validateUpload({
        declaredMimeType: "image/png",
        byteSize: 20,
        bytes: jpeg(),
        filename: "actually-jpeg.png",
      });
      assert(!mismatch.ok && mismatch.code === "TYPE_MISMATCH", "declared/real mismatch rejected");

      const good = validateUpload({ declaredMimeType: "image/webp", byteSize: 16, bytes: webp(), filename: "a.webp" });
      assert(good.ok && good.mimeType === "image/webp" && good.extension === "webp", "valid webp accepted");
    },
  },
  {
    name: "KEYS: collision-safe, prefixed, traversal-proof",
    run: () => {
      const a = buildUploadObjectKey("jpg", "abc123");
      const b = buildUploadObjectKey("jpg", "def456");
      assert(a.startsWith("desk/covers/") && b.startsWith("desk/covers/"), "fixed prefix");
      assert(a !== b, "different ids produce different keys");
      const hostile = buildUploadObjectKey("png", "../../etc/passwd");
      assert(!hostile.includes(".."), "traversal stripped from key");
      assert(hostile.startsWith("desk/covers/"), "hostile id stays inside prefix");
      assert(buildUploadObjectKey("png", "").startsWith("desk/covers/"), "empty id still safe");
    },
  },
  {
    name: "FILENAMES: display name is sanitised, never used as a path",
    run: () => {
      assert(toSafeDisplayFilename("../../../etc/passwd", "jpg") === "passwd.jpg", "directory portion dropped");
      assert(!toSafeDisplayFilename("a/b/c.png", "png").includes("/"), "no separators survive");
      assert(toSafeDisplayFilename(null, "webp") === "cover-image.webp", "null falls back");
      assert(toSafeDisplayFilename("   ", "jpg") === "cover-image.jpg", "blank falls back");
      assert(toSafeDisplayFilename("My Photo!.JPEG", "jpg") === "My-Photo-.jpg", "unsafe chars replaced");
    },
  },
  {
    name: "ROUTE: admin-guarded, blob-backed, registers through the media service",
    run: () => {
      const route = read("src/app/api/admin/media/upload/route.ts");
      assert(route.includes("requireAdminApi"), "uses the shared admin guard");
      assert(/allowedRoles:\s*\["founder",\s*"editor"\]/.test(route), "founder/editor only");
      assert(route.includes("validateUpload"), "server-side validation applied");
      assert(route.includes('from "@vercel/blob"') && route.includes("put("), "uploads to durable blob storage");
      assert(route.includes("createMedia"), "registers via the existing media service");
      assert(!route.includes("writeFile") && !route.includes("/tmp"), "never writes to the local filesystem");
      assert(route.includes("addRandomSuffix: true"), "overwrite-safe object naming");
      assert(route.includes("BLOB_READ_WRITE_TOKEN"), "fails safe when storage is unconfigured");
      // The path lives under /api/admin, which product-mode already classifies as private.
      assert(route.includes("export const runtime = \"nodejs\""), "node runtime for buffer handling");
    },
  },
  {
    name: "UI: native picker wired for gallery/PWA/desktop with duplicate-tap protection",
    run: () => {
      const button = read("src/modules/admin/media/media-upload-button.tsx");
      assert(button.includes("type=\"file\""), "real file input");
      assert(button.includes("accept={UPLOAD_ACCEPT_ATTRIBUTE}"), "accept filters the picker");
      assert(!button.includes("capture="), "no capture attribute (gallery stays available)");
      assert(button.includes("disabled={disabled || isUploading}"), "repeated taps cannot double-upload");
      assert(button.includes("progress"), "upload progress reported");
      assert(button.includes("Try again"), "retry offered after failure");
      const picker = read("src/modules/admin/media/media-picker.tsx");
      assert(picker.includes("MediaUploadButton"), "picker exposes upload");
      assert(picker.includes("Remove image"), "remove control present");
      assert(picker.includes("Choose from library") || picker.includes("Select from library"), "library still reachable");
    },
  },
  {
    name: "PUBLIC: covers render optimized, 16:9 and shift-free",
    run: () => {
      const premium = read("src/components/ui/premium.tsx");
      assert(premium.includes("aspect-[16/9]"), "16:9 box reserves space");
      assert(premium.includes("loading=\"lazy\""), "cards lazy-load below the fold");
      assert(premium.includes("sizes="), "responsive sizes set");
      const article = read("src/app/(marketing)/from-the-desk/[slug]/page.tsx");
      assert(article.includes("aspect-[16/9]") && article.includes("priority"), "article hero is priority + reserved");
      const config = read("next.config.ts");
      assert(config.includes("public.blob.vercel-storage.com"), "blob host allow-listed for the optimizer");
      assert(config.includes("image/avif") && config.includes("image/webp"), "modern formats served");
    },
  },
];

function main() {
  console.log("Desk media upload QA:");
  let passed = 0;
  let failed = 0;
  for (const group of groups) {
    try {
      group.run();
      console.log(`  ✓ ${group.name}`);
      passed += 1;
    } catch (error) {
      console.log(`  ✗ ${group.name} -- ${error instanceof Error ? error.message : String(error)}`);
      failed += 1;
    }
  }
  console.log(`\nmedia upload QA summary: ${passed} passed, ${failed} failed (of ${groups.length}).`);
  if (failed > 0) process.exit(1);
}

main();
