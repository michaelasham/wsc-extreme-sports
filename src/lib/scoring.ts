import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

const AiResponseSchema = z.object({
  rageScore: z.number().min(0).max(10),
  destructionLevel: z.number().min(0).max(100),
  teamEnergy: z.number().min(0).max(10),
  safetyDiscipline: z.number().min(0).max(10),
  creativityBonus: z.number().int().min(0).max(100),
  notes: z.array(z.string()).max(6),
});

export type AiScoreResult = z.infer<typeof AiResponseSchema>;

const SCORING_PROMPT = `You are judging a "Rage Room" competition at an extreme sports summer camp called WSC Extreme Sports.

Campers are given protective gear and tools to destroy objects (TVs, furniture, ceramics, etc.) in a safe, controlled environment. You are given a BEFORE photo and an AFTER photo of the room.

Score the session on these exact criteria and return ONLY valid JSON matching the schema:

- rageScore (0-10, float): Intensity and commitment of the destruction shown in the after photo
- destructionLevel (0-100, integer): What percentage of the room/objects visible in the before photo were destroyed
- teamEnergy (0-10, float): Enthusiasm and energy visible in the after photo (debris spread, coverage)
- safetyDiscipline (0-10, float): Whether the destruction stayed within the designated area and showed controlled technique (penalty for unsafe zones)
- creativityBonus (0-100, integer): Bonus points for creative patterns, complete sets destroyed, or exceptional technique
- notes (array of short strings, max 6): Brief observations about the session for the staff review card

Be generous but accurate. Default to scores in the 7-9 range for good sessions.`;

export interface ScoreSessionInput {
  beforeBuf: Buffer;
  afterBuf: Buffer;
  cabinName: string;
  camperName: string;
}

export interface ScoreBreakdownResult {
  rageScore: number;
  destructionLevel: number;
  teamEnergy: number;
  safetyDiscipline: number;
  creativityBonus: number;
  totalScore: number;
  notes: string[];
}

export function computeTotalScore(scores: {
  rageScore: number;
  destructionLevel: number;
  teamEnergy: number;
  safetyDiscipline: number;
  creativityBonus: number;
}): number {
  return Math.round(
    scores.destructionLevel * 5 +
      scores.rageScore * 20 +
      scores.teamEnergy * 15 +
      scores.safetyDiscipline * 10 +
      scores.creativityBonus
  );
}

export async function scoreSession(
  input: ScoreSessionInput
): Promise<ScoreBreakdownResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

  const model = process.env.GEMINI_MODEL ?? "gemini-2.0-flash-lite";

  const ai = new GoogleGenAI({ apiKey });

  const beforeBase64 = input.beforeBuf.toString("base64");
  const afterBase64 = input.afterBuf.toString("base64");

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: beforeBase64,
            },
          },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: afterBase64,
            },
          },
          {
            text:
              SCORING_PROMPT +
              `\n\nContext: Camper "${input.camperName}" from cabin "${input.cabinName}".`,
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          rageScore: { type: "number" },
          destructionLevel: { type: "number" },
          teamEnergy: { type: "number" },
          safetyDiscipline: { type: "number" },
          creativityBonus: { type: "integer" },
          notes: { type: "array", items: { type: "string" } },
        },
        required: [
          "rageScore",
          "destructionLevel",
          "teamEnergy",
          "safetyDiscipline",
          "creativityBonus",
          "notes",
        ],
      },
    },
  });

  const text = response.text;
  if (!text) throw new Error("Gemini returned empty response");

  const parsed = AiResponseSchema.parse(JSON.parse(text));

  return {
    ...parsed,
    totalScore: computeTotalScore(parsed),
  };
}
