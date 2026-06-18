import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

const BadgeSchema = z.object({
  name: z.string(),
  description: z.string(),
});

const AiResponseSchema = z.object({
  targetCompletion: z.number().int().min(0).max(100),
  destructionSeverity: z.number().int().min(0).max(100),
  impactScore: z.number().min(0).max(10),
  debrisSpread: z.number().int().min(0).max(100),
  overallScore: z.number().min(0).max(100),
  points: z.number().int().min(0).max(1000),
  confidence: z.number().min(0).max(1),
  analysis: z.array(z.string()).max(6),
  badges: z.array(BadgeSchema).max(3),
  improvementTips: z.array(z.string()).max(3),
});

export type AiScoreResult = z.infer<typeof AiResponseSchema>;
export type AiBadge = z.infer<typeof BadgeSchema>;

const SCORING_PROMPT = `You are a strict, evidence-based judge for a "Rage Room" destruction session at WSC Extreme Sports camp.

You receive a BEFORE photo, followed by up to 3 MID-SESSION action frames captured automatically during the session (in chronological order), and finally an AFTER photo. Score ONLY what is directly observable in the images — do not infer energy, attitude, or effort beyond what the photos show. The mid-session frames give you evidence of how destruction progressed; use them to inform your scores but weight the BEFORE and AFTER most heavily.

Scoring criteria:

targetCompletion (0–100, integer):
How fully was the primary target/object destroyed?
0 = untouched | 25 = minor visible damage | 50 = main surface damaged, structure intact | 75 = major structural destruction | 100 = completely destroyed beyond recognition
Default: 30–50 for a single partially-damaged item.

destructionSeverity (0–100, integer):
How physically severe is the damage to any objects in view?
0 = no damage | 30 = surface-level only | 50 = clear breakage, structure remains | 70 = heavy breakage and partial collapse | 90+ = shattered into many pieces
Default: 30–55 for a typical session.

impactScore (0–10, float):
How visually dramatic is the final result overall?
0 = no visible impact | 3 = mild | 5 = moderate | 7 = strong | 10 = extremely dramatic
Default: 3–6. Reserve 8+ for truly exceptional destruction.

debrisSpread (0–100, integer):
How much debris is visible in the after photo relative to before?
0 = no debris | 25 = debris only directly under/around object | 50 = debris across nearby area | 75 = debris across much of visible room | 100 = debris fills nearly entire scene
Default: 20–40.

overallScore (0–100, float):
Compute as: targetCompletion * 0.35 + destructionSeverity * 0.35 + (impactScore * 10) * 0.20 + debrisSpread * 0.10
Round to one decimal place.

points (0–1000, integer):
Math.round(overallScore * 10)

confidence (0–1, float):
How confident are you in your scores given image quality and visibility?
Lower this if images are blurry, dark, or don't clearly show the before/after comparison.

analysis (array of up to 6 short strings):
Specific, direct observations about what is visible. Be honest — note what's lacking, not just what's good.

badges (array of up to 3 objects with "name" and "description"):
Only award badges for genuinely observable achievements (e.g. "Full Dismantle", "Wide Impact Zone"). Default to 0–1 badges. Do not invent badges for mediocre performance.

improvementTips (array of up to 3 short strings):
Concrete, actionable suggestions based only on what the photos show is missing or could be improved.

Return ONLY valid JSON. If images are missing or too unclear to score, set confidence below 0.3 and use conservative mid-low defaults.`;

export interface ScoreSessionInput {
  beforeBuf: Buffer;
  afterBuf: Buffer;
  highlightBufs?: Buffer[];
  cabinName: string;
  camperName: string;
}

export function computePoints(scores: {
  targetCompletion: number;
  destructionSeverity: number;
  impactScore: number;
  debrisSpread: number;
}): { overallScore: number; points: number } {
  const normalizedImpact = scores.impactScore * 10;
  const overallScore =
    scores.targetCompletion * 0.35 +
    scores.destructionSeverity * 0.35 +
    normalizedImpact * 0.2 +
    scores.debrisSpread * 0.1;
  return {
    overallScore: Math.round(overallScore * 10) / 10,
    points: Math.round(overallScore * 10),
  };
}

function clamp(val: number, min: number, max: number) {
  return Math.min(Math.max(val, min), max);
}

export async function scoreSession(input: ScoreSessionInput): Promise<AiScoreResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

  const model = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
  const ai = new GoogleGenAI({ apiKey });

  const beforeBase64 = input.beforeBuf.toString("base64");
  const afterBase64 = input.afterBuf.toString("base64");

  const highlightParts = (input.highlightBufs ?? []).map((buf) => ({
    inlineData: { mimeType: "image/jpeg" as const, data: buf.toString("base64") },
  }));

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        role: "user",
        parts: [
          { text: "BEFORE:" },
          { inlineData: { mimeType: "image/webp", data: beforeBase64 } },
          ...(highlightParts.length > 0
            ? [{ text: "MID-SESSION FRAMES (chronological):" }, ...highlightParts]
            : []),
          { text: "AFTER:" },
          { inlineData: { mimeType: "image/webp", data: afterBase64 } },
          {
            text:
              SCORING_PROMPT +
              `\n\nContext: Camper "${input.camperName}" from "${input.cabinName}".`,
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          targetCompletion: { type: "integer" },
          destructionSeverity: { type: "integer" },
          impactScore: { type: "number" },
          debrisSpread: { type: "integer" },
          overallScore: { type: "number" },
          points: { type: "integer" },
          confidence: { type: "number" },
          analysis: { type: "array", items: { type: "string" } },
          badges: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                description: { type: "string" },
              },
              required: ["name", "description"],
            },
          },
          improvementTips: { type: "array", items: { type: "string" } },
        },
        required: [
          "targetCompletion", "destructionSeverity", "impactScore",
          "debrisSpread", "overallScore", "points", "confidence",
          "analysis", "badges", "improvementTips",
        ],
      },
    },
  });

  const text = response.text;
  if (!text) throw new Error("Gemini returned empty response");

  const raw = AiResponseSchema.parse(JSON.parse(text));

  // Clamp and recompute to prevent AI drift
  const clamped = {
    targetCompletion: clamp(Math.round(raw.targetCompletion), 0, 100),
    destructionSeverity: clamp(Math.round(raw.destructionSeverity), 0, 100),
    impactScore: clamp(raw.impactScore, 0, 10),
    debrisSpread: clamp(Math.round(raw.debrisSpread), 0, 100),
    confidence: clamp(raw.confidence, 0, 1),
    analysis: raw.analysis,
    badges: raw.badges,
    improvementTips: raw.improvementTips,
  };

  const { overallScore, points } = computePoints(clamped);
  return { ...clamped, overallScore, points };
}
