// Card 14.2B2 — eight V1 Tajika yogas (pure). Contract §12.
// Operationalized on the Card 14.2B1 aspect engine. Yogas are DETECTED as structured
// evidence (tier 0); benefic/malefic weighting is the orchestrator's job (Card 14.2C).
import type { TajikaYogaId } from "@/modules/varshaphal/premium/constants";
import type { TajikaGraha, VarshaphalEvidenceToken } from "@/modules/varshaphal/premium/types";
import { buildToken } from "@/modules/varshaphal/premium/engines/token";
import { evaluateTajikaAspect, type AspectBody } from "@/modules/varshaphal/premium/engines/tajika-aspects";

const IKKAVALA_MAX_DEG = 1;
const MALEFICS: TajikaGraha[] = ["SUN", "MARS", "SATURN"];

export type YogaPlanet = { graha: TajikaGraha; longitudeDeg: number; speedDegPerDay: number };

export type TajikaYogaInput = {
  significatorA: TajikaGraha;
  significatorB: TajikaGraha;
  planets: Partial<Record<TajikaGraha, YogaPlanet>>;
};

export type DetectedYoga = { yoga: TajikaYogaId; participants: TajikaGraha[]; note: string };

export type TajikaYogaResult = {
  yogas: DetectedYoga[];
  tokens: VarshaphalEvidenceToken[];
  partialFlags: string[];
};

const body = (p: YogaPlanet): AspectBody => ({ graha: p.graha, longitudeDeg: p.longitudeDeg, speedDegPerDay: p.speedDegPerDay });
const applying = (r: ReturnType<typeof evaluateTajikaAspect>): boolean => r.active && (r.motion === "APPLYING" || r.motion === "EXACT");

export function evaluateTajikaYogas(input: TajikaYogaInput): TajikaYogaResult {
  const { significatorA, significatorB, planets } = input;
  const partialFlags: string[] = [];
  const A = planets[significatorA];
  const B = planets[significatorB];
  if (!A || !B) {
    partialFlags.push("MISSING_SIGNIFICATOR");
    return { yogas: [], tokens: [], partialFlags };
  }

  const yogas: DetectedYoga[] = [];
  const pair = [significatorA, significatorB];
  const aspAB = evaluateTajikaAspect(body(A), body(B));

  if (aspAB.active && applying(aspAB)) yogas.push({ yoga: "ITHASALA", participants: pair, note: `${significatorA}-${significatorB} applying at ${aspAB.angle} deg` });
  if (aspAB.active && aspAB.motion === "SEPARATING") yogas.push({ yoga: "ISHRAFA", participants: pair, note: `${significatorA}-${significatorB} separating at ${aspAB.angle} deg` });
  if (aspAB.active && aspAB.degreesToExact != null && aspAB.degreesToExact <= IKKAVALA_MAX_DEG) yogas.push({ yoga: "IKKAVALA", participants: pair, note: `near-exact union (${aspAB.degreesToExact.toFixed(3)} deg)` });
  if (aspAB.active && (aspAB.angle === 90 || aspAB.angle === 180)) yogas.push({ yoga: "INDUVARA", participants: pair, note: `mutual kendra aspect at ${aspAB.angle} deg` });

  // Kamboola — Moon-mediated reinforcement.
  const moon = planets.MOON;
  if (moon) {
    if (significatorA === "MOON" || significatorB === "MOON") {
      const other = significatorA === "MOON" ? B : A;
      if (applying(evaluateTajikaAspect(body(moon), body(other)))) yogas.push({ yoga: "KAMBOOLA", participants: ["MOON", other.graha], note: "Moon applying to significator" });
    } else {
      const toA = applying(evaluateTajikaAspect(body(moon), body(A)));
      const toB = applying(evaluateTajikaAspect(body(moon), body(B)));
      if (toA || toB) yogas.push({ yoga: "KAMBOOLA", participants: ["MOON", toA ? significatorA : significatorB], note: "Moon applying to a significator" });
    }
  }

  const others = (Object.values(planets).filter(Boolean) as YogaPlanet[]).filter((p) => p.graha !== significatorA && p.graha !== significatorB);

  // Nakta — translation of light by a faster intermediary when A,B are not in mutual orb.
  if (!aspAB.active) {
    for (const t of others) {
      const faster = Math.abs(t.speedDegPerDay) > Math.abs(A.speedDegPerDay) && Math.abs(t.speedDegPerDay) > Math.abs(B.speedDegPerDay);
      if (faster && applying(evaluateTajikaAspect(body(t), body(A))) && applying(evaluateTajikaAspect(body(t), body(B)))) {
        yogas.push({ yoga: "NAKTA", participants: [significatorA, significatorB, t.graha], note: `translation via ${t.graha}` });
        break;
      }
    }
  }

  // Yamaya — collection of light by a slower third that both significators apply to.
  for (const t of others) {
    const slower = Math.abs(t.speedDegPerDay) < Math.abs(A.speedDegPerDay) && Math.abs(t.speedDegPerDay) < Math.abs(B.speedDegPerDay);
    if (slower && applying(evaluateTajikaAspect(body(A), body(t))) && applying(evaluateTajikaAspect(body(B), body(t)))) {
      yogas.push({ yoga: "YAMAYA", participants: [significatorA, significatorB, t.graha], note: `collection via ${t.graha}` });
      break;
    }
  }

  // Manau — a malefic within orb of a significator obstructs a forming Ithasala.
  if (aspAB.active && applying(aspAB)) {
    for (const m of MALEFICS) {
      if (m === significatorA || m === significatorB) continue;
      const mp = planets[m];
      if (!mp) continue;
      if ((evaluateTajikaAspect(body(mp), body(A))).active || (evaluateTajikaAspect(body(mp), body(B))).active) {
        yogas.push({ yoga: "MANAU", participants: [significatorA, significatorB, m], note: `${m} obstructs the forming Ithasala` });
        break;
      }
    }
  }

  const tokens = yogas.map((y) => buildToken(`YOGA_${y.yoga}_V1`, "TAJIKA_YOGA", 0, "NEUTRAL", y.note, ["YOGA", y.yoga, ...y.participants]));
  return { yogas, tokens, partialFlags };
}
