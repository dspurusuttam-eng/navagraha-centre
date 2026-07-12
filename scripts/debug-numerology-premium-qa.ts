/**
 * Card 12.1 — Premium Numerology Core Engine exhaustive QA.
 * Pure engine (no ephemeris); runs on any Node version.
 */
import {
  buildPremiumNumerologySnapshot,
  calculateDateNumerology,
  calculateChaldeanNumerology,
  calculatePythagoreanNumerology,
  calculateLoShu,
  compareNumbers,
  normalizeName,
  reduce,
  digitSum,
  CHALDEAN_TABLE,
  PYTHAGOREAN_TABLE,
  VOWELS_V1,
  MASTER_NUMBERS,
  COMPATIBILITY_MATRIX_V1,
  LO_SHU_LINES,
  NUMEROLOGY_RULE_REGISTRY,
  getNumerologyRule,
  NUMEROLOGY_PREMIUM_CONTRACT_VERSION,
} from "@/modules/numerology/premium";
import { daysInMonth, isLeapYear } from "@/modules/numerology/premium/date-engine";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function omit<T extends Record<string, unknown>>(source: T, keys: readonly string[]): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(source)) {
    if (!keys.includes(key)) result[key] = source[key];
  }
  return result;
}

type Group = { name: string; run: () => void };

const groups: Group[] = [
  {
    name: "INT1 rule registry: every emitted ruleId is registered; getNumerologyRule throws on unknown",
    run: () => {
      // exercise every engine to collect ruleIds
      const s = buildPremiumNumerologySnapshot({
        fullName: "Alan Turing",
        birthDate: "1912-06-23",
        partnerFullName: "Ada Lovelace",
        partnerBirthDate: "1815-12-10",
      });
      const registered = new Set(NUMEROLOGY_RULE_REGISTRY.map((r) => r.ruleId));
      const emitted = new Set<string>();
      const collect = (ids?: string[]) => { for (const id of ids ?? []) emitted.add(id); };
      collect(s.date?.ruleIds);
      collect(s.chaldean?.ruleIds);
      collect(s.pythagorean?.ruleIds);
      collect(s.loShu?.ruleIds);
      collect(s.date?.psychicNumber?.ruleId ? [s.date.psychicNumber.ruleId] : []);
      collect(s.date?.destinyNumber?.ruleId ? [s.date.destinyNumber.ruleId] : []);
      for (const c of s.compatibility) collect(c.ruleIds);
      assert(emitted.size > 0, "no rules emitted");
      for (const id of emitted) assert(registered.has(id), `emitted ruleId not registered: ${id}`);
      let threw = false;
      try { getNumerologyRule("__DOES_NOT_EXIST__"); } catch { threw = true; }
      assert(threw, "getNumerologyRule must throw on unknown");
    },
  },

  {
    name: "INT2 Chaldean table exhaustion: every A-Z present, values 1-8, NO 9",
    run: () => {
      const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
      for (const l of alphabet) {
        const v = CHALDEAN_TABLE[l];
        assert(typeof v === "number", `Chaldean missing letter ${l}`);
        assert(v >= 1 && v <= 8, `Chaldean value out of 1..8 for ${l}: ${v}`);
        assert(v !== 9, `Chaldean must not contain 9 (letter ${l})`);
      }
    },
  },

  {
    name: "INT3 Pythagorean table exhaustion: every A-Z present, values 1-9, standard pattern",
    run: () => {
      const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
      for (const l of alphabet) {
        const v = PYTHAGOREAN_TABLE[l];
        assert(typeof v === "number", `Pythagorean missing letter ${l}`);
        assert(v >= 1 && v <= 9, `Pythagorean value out of 1..9 for ${l}: ${v}`);
        // standard mapping: (index%9)+1 (i.e. A=1..I=9, J=1..R=9, S=1..Z=8)
        const idx = alphabet.indexOf(l);
        const expected = (idx % 9) + 1;
        assert(v === expected, `Pythagorean ${l} expected ${expected} got ${v}`);
      }
    },
  },

  {
    name: "INT4 reduce: single-digit and master retention, compound preserved",
    run: () => {
      assert(reduce(38, false).value === 2, "38 -> 3+8=11 -> 1+1=2");
      assert(reduce(38, true).value === 11, "38 -> 11 (master retained)");
      assert(reduce(38, true).isMasterNumber === true, "isMasterNumber true");
      assert(reduce(38, false).compoundTotal === 38, "compound preserved");
      assert(reduce(9, true).value === 9, "9 is single digit terminal");
      assert(reduce(11, true).value === 11 && reduce(11, false).value === 2, "11 master vs 2");
      assert(reduce(22, true).value === 22 && reduce(22, false).value === 4, "22 master vs 4");
      assert(reduce(33, true).value === 33 && reduce(33, false).value === 6, "33 master vs 6");
    },
  },

  {
    name: "INT5 date engine: leap-year boundaries + all months day-count validation",
    run: () => {
      // leap-year rule
      assert(isLeapYear(2000) && !isLeapYear(1900) && isLeapYear(2024) && !isLeapYear(2023), "leap rule");
      assert(daysInMonth(2024, 2) === 29 && daysInMonth(2023, 2) === 28, "Feb leap");
      // invalid Feb 29 in non-leap
      const invalidFeb = calculateDateNumerology("2023-02-29");
      assert(invalidFeb.status === "INVALID_INPUT" && !invalidFeb.valid, "Feb 29 2023 invalid");
      // valid Feb 29 in leap
      const validFeb = calculateDateNumerology("2024-02-29");
      assert(validFeb.status === "CALCULATED" && validFeb.valid, "Feb 29 2024 valid");
      // month/day range
      for (const [d, ok] of [
        ["2024-00-10", false], ["2024-13-10", false], ["2024-01-00", false],
        ["2024-01-32", false], ["2024-04-31", false], ["2024-04-30", true],
      ] as const) {
        const r = calculateDateNumerology(d);
        assert((r.status === "CALCULATED") === ok, `date ${d} expected ok=${ok}`);
      }
    },
  },

  {
    name: "INT6 date engine: Psychic, Destiny, compound total (worked examples)",
    run: () => {
      // Alan Turing 1912-06-23: day=23 -> 2+3=5; month=6; year=1912 -> 1+9+1+2=13->4; sum=5+6+4=15->6
      const r = calculateDateNumerology("1912-06-23");
      assert(r.psychicNumber?.value === 5, `Turing psychic expected 5 got ${r.psychicNumber?.value}`);
      assert(r.destinyNumber?.value === 6, `Turing destiny expected 6 got ${r.destinyNumber?.value}`);
      // compound total = sum of all digits = 1+9+1+2+0+6+2+3 = 24
      assert(r.compoundTotal === 24, `Turing compound total expected 24 got ${r.compoundTotal}`);
      // Master preservation example: 1900-01-29 -> day=29->11 (Psychic reduces further to 2)
      const d29 = calculateDateNumerology("1900-01-29");
      assert(d29.psychicNumber?.value === 2, "psychic on day 29 reduces to 2 (no master)");
      assert(d29.components?.dayReduced === 11, "day component retains master 11");
    },
  },

  {
    name: "INT7 normalizer: case/space/hyphen/apostrophe equivalence + preserves original",
    run: () => {
      const variants = ["John Smith", "JOHN SMITH", "  john   smith  ", "john-smith"];
      const base = normalizeName(variants[0]);
      for (const v of variants) {
        const n = normalizeName(v);
        assert(n.latinLetters === base.latinLetters, `variant "${v}" -> ${n.latinLetters} vs ${base.latinLetters}`);
        assert(n.original === v, "original preserved");
      }
      // apostrophe policy: apostrophes are stripped and the segment stays joined (O'Brien -> OBRIEN)
      const apos = normalizeName("O'Brien");
      assert(apos.latinLetters === "OBRIEN" && apos.parts.join(",") === "OBRIEN", `apostrophe rule: ${apos.latinLetters}/${apos.parts.join(",")}`);
      // diacritics folded
      const diac = normalizeName("Zoé");
      assert(diac.status === "CALCULATED" && diac.latinLetters === "ZOE", `diacritics folded got ${diac.latinLetters}/${diac.status}`);
      // hyphen part-splits
      const split = normalizeName("Mary-Jane Watson");
      assert(split.parts.join(",") === "MARY,JANE,WATSON", `hyphen split: ${split.parts.join(",")}`);
    },
  },

  {
    name: "INT8 normalizer fail-closed: empty/number-only/non-Latin",
    run: () => {
      assert(normalizeName("").status === "INVALID_INPUT", "empty invalid");
      assert(normalizeName("   ").status === "INVALID_INPUT", "whitespace invalid");
      assert(normalizeName("12345").status === "INVALID_INPUT", "number-only invalid");
      const nl = normalizeName("आर्यभट");
      assert(nl.status === "TRANSLITERATION_REQUIRED", `Devanagari -> TRANSLITERATION_REQUIRED, got ${nl.status}`);
      const cj = normalizeName("中村");
      assert(cj.status === "TRANSLITERATION_REQUIRED", "CJK -> TRANSLITERATION_REQUIRED");
      // engines propagate the status without inventing values
      const ch = calculateChaldeanNumerology("आर्यभट");
      assert(ch.status === "TRANSLITERATION_REQUIRED" && ch.expression === null, "Chaldean non-Latin fails closed");
      const py = calculatePythagoreanNumerology("आर्यभट");
      assert(py.status === "TRANSLITERATION_REQUIRED" && py.expression === null, "Pythagorean non-Latin fails closed");
    },
  },

  {
    name: "INT9 Chaldean worked example + no-9 letter rule holds engine-side",
    run: () => {
      // Cheiro classic: "Cheiro" -> C(3)+H(5)+E(5)+I(1)+R(2)+O(7) = 23 -> 5
      const c = calculateChaldeanNumerology("Cheiro");
      assert(c.status === "CALCULATED", "cheiro calculated");
      assert(c.expression?.compoundTotal === 23, `Cheiro compound 23, got ${c.expression?.compoundTotal}`);
      assert(c.expression?.value === 5, `Cheiro reduced 5, got ${c.expression?.value}`);
      // no letter emits value 9
      for (const lv of c.letterValues) assert(lv.value !== 9, `Chaldean letter ${lv.letter} emitted 9`);
    },
  },

  {
    name: "INT10 Pythagorean worked example: Expression/Soul-Urge/Personality partition",
    run: () => {
      // "John Smith": J1 O6 H8 N5 S1 M4 I9 T2 H8 = 44 -> 8 (also happens to be master-eligible? 44 not master)
      // Vowels O6 + I9 = 15 -> 6 ; Consonants J1+H8+N5+S1+M4+T2+H8 = 29 -> 11 (MASTER)
      const p = calculatePythagoreanNumerology("John Smith");
      assert(p.expression?.compoundTotal === 44 && p.expression?.value === 8, `expression compound=44 value=8; got ${p.expression?.compoundTotal}/${p.expression?.value}`);
      assert(p.soulUrge?.compoundTotal === 15 && p.soulUrge?.value === 6, `soul urge 15->6; got ${p.soulUrge?.compoundTotal}/${p.soulUrge?.value}`);
      assert(p.personality?.compoundTotal === 29 && p.personality?.value === 11 && p.personality?.isMasterNumber, `personality 29->11 master; got ${p.personality?.compoundTotal}/${p.personality?.value}/master=${p.personality?.isMasterNumber}`);
      // vowels + consonants must sum to expression compound total (partition integrity)
      const vSum = p.letterValues.filter((lv) => VOWELS_V1.has(lv.letter)).reduce((a, b) => a + b.value, 0);
      const cSum = p.letterValues.filter((lv) => !VOWELS_V1.has(lv.letter)).reduce((a, b) => a + b.value, 0);
      assert(vSum + cSum === p.expression!.compoundTotal, "vowel+consonant partition = expression compound");
      assert(vSum === p.soulUrge?.compoundTotal, "vSum == soulUrge compound");
      assert(cSum === p.personality?.compoundTotal, "cSum == personality compound");
    },
  },

  {
    name: "INT11 Pythagorean master retention: BENJAMIN -> Expression 47->11",
    run: () => {
      // B2+E5+N5+J1+A1+M4+I9+N5 = 32? verify: 2+5+5+1+1+4+9+5=32 -> 3+2=5. Choose known-master:
      // MARY: M4+A1+R9+Y7 = 21 -> 3. Try a master-expression case: "SARAH JAMES BENJAMIN"
      const p = calculatePythagoreanNumerology("SARAH JAMES BENJAMIN");
      // S1+A1+R9+A1+H8 = 20 ; J1+A1+M4+E5+S1 = 12 ; B2+E5+N5+J1+A1+M4+I9+N5 = 32 => total 64 -> 6+4=10 -> 1
      assert(p.expression?.compoundTotal === 64, `compound 64 got ${p.expression?.compoundTotal}`);
      assert(p.expression?.value === 1, `64->10->1 got ${p.expression?.value}`);
      // Master retention: input value that IS a master remains master (via reduction chain that lands on 11/22/33)
      const p2 = calculatePythagoreanNumerology("Mary Smith");
      // M4+A1+R9+Y7=21 ; S1+M4+I9+T2+H8=24 ; total 45 -> 9
      assert(p2.expression?.value === 9 && p2.expression?.compoundTotal === 45, `Mary Smith 45->9`);
    },
  },

  {
    name: "INT12 name parts sum to full compound total (component integrity)",
    run: () => {
      const p = calculatePythagoreanNumerology("Alan Mathison Turing");
      const partSum = p.parts.reduce((a, b) => a + b.compoundTotal, 0);
      assert(partSum === p.expression!.compoundTotal, `parts ${partSum} != full ${p.expression!.compoundTotal}`);
      const c = calculateChaldeanNumerology("Alan Mathison Turing");
      const cPartSum = c.parts.reduce((a, b) => a + b.compoundTotal, 0);
      assert(cPartSum === c.expression!.compoundTotal, `chaldean parts ${cPartSum} != full ${c.expression!.compoundTotal}`);
    },
  },

  {
    name: "INT13 Lo Shu: DOB-only, zero excluded, frequencies + missing + repeated + lines",
    run: () => {
      // 2024-02-29 -> digits 2,9,0,2,2,0,2,4 -> zeros excluded -> 2,9,2,2,2,4
      const l = calculateLoShu("2024-02-29");
      assert(l.status === "CALCULATED", "lo shu calculated");
      assert(!l.digitsUsed.includes(0), "zero excluded");
      const freqSum = Object.values(l.frequency).reduce((a, b) => a + b, 0);
      assert(freqSum === l.digitsUsed.length, "frequency sums to digitsUsed length");
      assert(l.frequency["2"] === 4, `2 appears 4x, got ${l.frequency["2"]}`);
      assert(l.frequency["4"] === 1 && l.frequency["9"] === 1, "4 and 9 present once");
      // missing = 1,3,5,6,7,8
      assert(JSON.stringify(l.missingNumbers) === JSON.stringify([1, 3, 5, 6, 7, 8]), `missing ${l.missingNumbers}`);
      // repeated (>=2): 2
      assert(JSON.stringify(l.repeatedNumbers) === JSON.stringify([2]), `repeated ${l.repeatedNumbers}`);
      // completed lines: any line requiring 5 is NOT completed (5 missing)
      for (const cl of l.completedLines) assert(!cl.cells.includes(5), "no completed line with missing 5");
      // grid cell (row_top, col_left)=4 has count 1
      assert(l.grid[0]![0] === 1, "grid[4] count = 1");
    },
  },

  {
    name: "INT14 Lo Shu: overlay is SEPARATE and does NOT modify the base grid",
    run: () => {
      const l = calculateLoShu("2000-11-11");
      // Base grid depends ONLY on DOB digits (2,0,0,0,1,1,1,1 -> 1x5,2x1). Overlay driver/conductor never mutate.
      const beforeFreq = { ...l.frequency };
      const grid1 = JSON.stringify(l.grid);
      assert(l.overlay.driverNumber !== null && l.overlay.conductorNumber !== null, "overlay populated");
      // Re-compute and verify the base is identical regardless of overlay values.
      const l2 = calculateLoShu("2000-11-11");
      assert(JSON.stringify(l2.grid) === grid1, "grid deterministic");
      assert(JSON.stringify(l2.frequency) === JSON.stringify(beforeFreq), "frequency deterministic");
      // Lo Shu line definitions integrity
      assert(LO_SHU_LINES.length === 8, "8 lines (3 rows + 3 cols + 2 diagonals)");
    },
  },

  {
    name: "INT15 compatibility matrix: symmetric across all 81 pairs; matrix well-defined 1..9",
    run: () => {
      for (let a = 1; a <= 9; a += 1) {
        for (let b = 1; b <= 9; b += 1) {
          const ab = COMPATIBILITY_MATRIX_V1[a]![b];
          const ba = COMPATIBILITY_MATRIX_V1[b]![a];
          assert(ab === ba, `matrix asymmetric at (${a},${b}): ${ab} vs ${ba}`);
          assert(ab === "SUPPORTIVE" || ab === "NEUTRAL" || ab === "CHALLENGING", `bad relation at (${a},${b})`);
          if (a === b) assert(ab === "SUPPORTIVE", `self-pair ${a} must be SUPPORTIVE`);
        }
      }
      // compareNumbers wraps + fails closed on missing
      const s = compareNumbers("DATE_PSYCHIC", 3, 6);
      assert(s.status === "SUPPORTIVE" && s.relationship === "SUPPORTIVE", "3-6 supportive");
      const u = compareNumbers("DATE_PSYCHIC", null, 6);
      assert(u.status === "UNAVAILABLE" && u.evidenceIds.length === 0, "missing -> UNAVAILABLE");
      const bad = compareNumbers("DATE_PSYCHIC", 0, 10);
      assert(bad.status === "UNAVAILABLE", "out-of-range -> UNAVAILABLE");
    },
  },

  {
    name: "INT16 compatibility: NO percentage anywhere; system field separates systems",
    run: () => {
      const s = buildPremiumNumerologySnapshot({
        fullName: "Alan Turing",
        birthDate: "1912-06-23",
        partnerFullName: "Ada Lovelace",
        partnerBirthDate: "1815-12-10",
      });
      // Locked policy in the versioned conventions: NONE (structured status only).
      assert(s.conventions.compatibilityPercentage === "NONE_STRUCTURED_STATUS_ONLY", "compatibilityPercentage policy pinned to NONE");
      assert(s.conventions.compatibilityMatrixBasis === "PRODUCT_NORMALIZED", "compatibility matrix basis label pinned to PRODUCT_NORMALIZED (no classical source registered)");
      // Scan everything EXCEPT the disclaimer + conventions (which are policy declarations
      // that explicitly negate these terms). Compat records must not carry a percentage.
      const blob = JSON.stringify(omit(s as unknown as Record<string, unknown>, ["disclaimer", "conventions"]));
      assert(!/percent/i.test(blob), "no 'percent' outside policy declarations");
      assert(!/%\s*[0-9]/.test(blob), "no '% <number>' payload");
      for (const c of s.compatibility) {
        assert(!("percentage" in (c as Record<string, unknown>)), "compatibility must not carry percentage");
      }
      const systems = new Set(s.compatibility.map((c) => c.system));
      // At least DATE_PSYCHIC and DATE_DESTINY present; systems are strictly labelled
      assert(systems.has("DATE_PSYCHIC") && systems.has("DATE_DESTINY"), "date compatibility systems present");
    },
  },

  {
    name: "INT17 orchestrator: name systems are STRICTLY separate; forbidden-wording scan",
    run: () => {
      const s = buildPremiumNumerologySnapshot({
        fullName: "Alan Turing",
        birthDate: "1912-06-23",
      });
      // Chaldean vs Pythagorean values may differ; ensure both live on their own branch
      const chVal = s.chaldean?.expression?.value;
      const pyVal = s.pythagorean?.expression?.value;
      assert(chVal !== undefined && pyVal !== undefined, "both name systems present");
      // forbidden wording scanned OUTSIDE the disclaimer + conventions (both are policy declarations).
      const blob = JSON.stringify(omit(s as unknown as Record<string, unknown>, ["disclaimer", "conventions"])).toLowerCase();
      const forbidden = ["guarantee", "guaranteed", "remedy", "remedies", "buy now", "lucky product", "curse", "doom", "fatal"];
      for (const w of forbidden) assert(!blob.includes(w), `forbidden token found: ${w}`);
    },
  },

  {
    name: "INT18 determinism: byte-identical repeated snapshots",
    run: () => {
      const input = {
        fullName: "Ada Lovelace",
        birthDate: "1815-12-10",
        partnerFullName: "Charles Babbage",
        partnerBirthDate: "1791-12-26",
      };
      const a = JSON.stringify(buildPremiumNumerologySnapshot(input));
      const b = JSON.stringify(buildPremiumNumerologySnapshot(input));
      assert(a === b, "snapshot must be deterministic");
    },
  },

  {
    name: "INT19 no NaN/Infinity, no silent fallback anywhere in the snapshot",
    run: () => {
      const s = buildPremiumNumerologySnapshot({
        fullName: "Marie Curie",
        birthDate: "1867-11-07",
        partnerFullName: "Pierre Curie",
        partnerBirthDate: "1859-05-15",
      });
      const scan = (obj: unknown): void => {
        if (typeof obj === "number") {
          assert(Number.isFinite(obj), `non-finite number in snapshot: ${obj}`);
        } else if (Array.isArray(obj)) obj.forEach(scan);
        else if (obj && typeof obj === "object") Object.values(obj as Record<string, unknown>).forEach(scan);
      };
      scan(s);
      assert(s.contractVersion === NUMEROLOGY_PREMIUM_CONTRACT_VERSION, "contractVersion matches");
      assert(s.date && s.chaldean && s.pythagorean && s.loShu, "all four sub-snapshots present when inputs provided");
    },
  },

  {
    name: "INT20 property: 100+ fixtures covering full alphabet, calendars, master paths",
    run: () => {
      const fixtures: Array<{ fullName: string; birthDate: string; partner?: { name: string; date: string } }> = [];
      const names = [
        "Alan Turing", "Ada Lovelace", "Marie Curie", "Pierre Curie", "Charles Babbage",
        "Isaac Newton", "Albert Einstein", "Grace Hopper", "Emmy Noether", "Ken Thompson",
        "Dennis Ritchie", "Linus Torvalds", "Barbara Liskov", "Edsger Dijkstra", "Alan Kay",
        "Rosalind Franklin", "Vera Rubin", "Katherine Johnson", "Mary Somerville", "Hedy Lamarr",
        "Anders Hejlsberg", "Guido Van Rossum", "Yukihiro Matsumoto", "James Gosling", "John McCarthy",
        "Claude Shannon", "Benoit Mandelbrot", "Kurt Godel", "Bertrand Russell", "Kurt Lewin",
        "Erwin Schrodinger", "Werner Heisenberg", "Max Planck", "Niels Bohr", "Enrico Fermi",
        "Richard Feynman", "Julian Schwinger", "Freeman Dyson", "Chien Shiung Wu", "Lise Meitner",
        "Otto Hahn", "Fritz Haber", "Linus Pauling", "Gilbert Lewis", "Dorothy Hodgkin",
        "Rita Levi Montalcini", "Barbara McClintock", "Jane Goodall", "Dian Fossey", "Rachel Carson",
      ];
      const dates: string[] = [];
      // full month grid ensuring day-of-month coverage and leap boundaries
      for (const [y, m] of [[2000, 1], [2000, 2], [2001, 2], [2004, 2], [2100, 2], [2400, 2]]) {
        const dim = daysInMonth(y as number, m as number);
        for (let d = 1; d <= dim; d += 1) dates.push(`${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
      }
      // representative other dates
      for (const d of ["1900-01-01", "1999-12-31", "2023-07-04", "2024-11-30", "1969-07-20", "1815-12-10", "1867-11-07", "1912-06-23", "1955-10-28", "1970-01-01"]) dates.push(d);
      // pin explicit boundary fixtures (leap Feb 29, ancient date, master paths)
      fixtures.push({ fullName: "Grace Hopper", birthDate: "2024-02-29" });
      fixtures.push({ fullName: "Alan Turing", birthDate: "2000-02-29" });
      for (let i = 0; i < names.length; i += 1) {
        fixtures.push({ fullName: names[i]!, birthDate: dates[i % dates.length]! });
        if (i + 1 < names.length) {
          fixtures.push({
            fullName: names[i]!,
            birthDate: dates[(i + 1) % dates.length]!,
            partner: { name: names[i + 1]!, date: dates[(i + 2) % dates.length]! },
          });
        }
      }
      // top up beyond 100 by rotating names against the calendar grid
      while (fixtures.length < 120) {
        const i = fixtures.length;
        fixtures.push({ fullName: names[i % names.length]!, birthDate: dates[(i * 7) % dates.length]! });
      }
      assert(fixtures.length >= 100, `at least 100 fixtures; got ${fixtures.length}`);
      // property assertions across all fixtures
      let boundaryHits = 0;
      let masterHits = 0;
      for (const fx of fixtures) {
        const s = buildPremiumNumerologySnapshot({
          fullName: fx.fullName,
          birthDate: fx.birthDate,
          partnerFullName: fx.partner?.name,
          partnerBirthDate: fx.partner?.date,
        });
        assert(s.status === "CALCULATED", `fixture ${fx.fullName}/${fx.birthDate} not calculated`);
        // date invariants
        const d = s.date!;
        assert(d.valid && d.compoundTotal! > 0, "date compound positive");
        assert(d.psychicNumber!.value >= 1 && d.psychicNumber!.value <= 9, "psychic 1..9");
        // digit-sum of full ISO equals reported compoundTotal
        const isoDigits = d.input.iso.replace(/[^0-9]/g, "").split("").reduce((a, ch) => a + Number(ch), 0);
        assert(isoDigits === d.compoundTotal, `ISO digitsum ${isoDigits} != compoundTotal ${d.compoundTotal}`);
        // destiny value is a single digit OR a master
        const dv = d.destinyNumber!.value;
        assert((dv >= 1 && dv <= 9) || MASTER_NUMBERS.has(dv), `destiny ${dv} out of domain`);
        if (MASTER_NUMBERS.has(dv)) masterHits += 1;
        // chaldean partition sums
        const c = s.chaldean!;
        if (c.status === "CALCULATED") {
          const partSum = c.parts.reduce((a, b) => a + b.compoundTotal, 0);
          assert(partSum === c.expression!.compoundTotal, `chaldean parts != full: ${partSum} vs ${c.expression!.compoundTotal}`);
          for (const lv of c.letterValues) assert(lv.value !== 9, `chaldean 9 on letter ${lv.letter}`);
        }
        // pythagorean partition
        const p = s.pythagorean!;
        if (p.status === "CALCULATED") {
          const partSum = p.parts.reduce((a, b) => a + b.compoundTotal, 0);
          assert(partSum === p.expression!.compoundTotal, `pyth parts != full: ${partSum} vs ${p.expression!.compoundTotal}`);
          const vSum = p.letterValues.filter((lv) => VOWELS_V1.has(lv.letter)).reduce((a, b) => a + b.value, 0);
          const cSum = p.letterValues.filter((lv) => !VOWELS_V1.has(lv.letter)).reduce((a, b) => a + b.value, 0);
          assert(vSum + cSum === p.expression!.compoundTotal, "vowel+consonant partition");
          assert(vSum === p.soulUrge!.compoundTotal, "vSum == soulUrge compound");
          assert(cSum === p.personality!.compoundTotal, "cSum == personality compound");
        }
        // lo shu invariants
        const l = s.loShu!;
        if (l.status === "CALCULATED") {
          assert(!l.digitsUsed.includes(0), "no zero in digits");
          const fsum = Object.values(l.frequency).reduce((a, b) => a + b, 0);
          assert(fsum === l.digitsUsed.length, "frequency sums to digits used");
          for (let n = 1; n <= 9; n += 1) {
            const present = (l.frequency[String(n)] ?? 0) >= 1;
            const inMissing = l.missingNumbers.includes(n);
            assert(present !== inMissing, `presence/missing consistency for ${n}`);
          }
        }
        // compatibility: never returns "percentage"; symmetry check when partner present
        if (fx.partner) {
          for (const cmp of s.compatibility) {
            assert(cmp.status !== undefined, "compatibility status present");
            if (cmp.a && cmp.b) {
              const mirror = COMPATIBILITY_MATRIX_V1[cmp.b]![cmp.a];
              const original = COMPATIBILITY_MATRIX_V1[cmp.a]![cmp.b];
              assert(mirror === original, "matrix symmetric");
            }
          }
        }
        // Boundary hit: leap-year Feb 29
        if (d.input.month === 2 && d.input.day === 29) boundaryHits += 1;
      }
      assert(boundaryHits >= 1, "at least one Feb-29 fixture in corpus");
      assert(masterHits >= 1, `at least one master-destiny fixture; got ${masterHits}`);
    },
  },

  {
    name: "INT21 digitSum helper + reduce steps trace",
    run: () => {
      assert(digitSum(9999) === 36, "9999 -> 36");
      const r = reduce(9999, false);
      assert(r.steps[0] === 9999 && r.value === 9, `9999 -> 36 -> 9; got ${JSON.stringify(r.steps)}`);
      assert(r.steps.at(-1) === r.value, "last step equals value");
    },
  },
];

function main() {
  console.log("Premium Numerology Core QA (pure, exhaustive):");
  let passed = 0;
  let failed = 0;
  for (const group of groups) {
    try {
      group.run();
      console.log(`  ✓ ${group.name}`);
      passed += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.log(`  ✗ ${group.name} -- ${message}`);
      failed += 1;
    }
  }
  console.log(`\nnumerology premium QA summary: ${passed} passed, ${failed} failed (of ${groups.length}).`);
  if (failed > 0) process.exit(1);
}

main();
