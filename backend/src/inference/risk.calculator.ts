import { Emotion, PpeDetection, Risk, RiskLevel } from './interfaces/inference.interface';

// Emotions considered dangerous in a workplace-safety context
const NEGATIVE_EMOTIONS = ['anger', 'fear'];

// Required protective equipment we expect to see
const REQUIRED_PPE = ['helmet'];

/**
 * Pure function that turns detections into a risk assessment.
 * Pure (no I/O, no randomness) so it is trivial to unit-test.
 *
 * Rules:
 *  - Missing required PPE (e.g. no helmet) raises risk.
 *  - A strong negative emotion (anger/fear) raises risk.
 *  - The final score is the sum of the contributing factors (capped at 1).
 */
export function computeRisk(
  emotions: Emotion[],
  ppe: PpeDetection[],
): Risk {
  const reasons: string[] = [];
  let score = 0;

  // 1) Check for missing required PPE
  const detectedClasses = ppe.map((p) => p.class);
  for (const required of REQUIRED_PPE) {
    if (!detectedClasses.includes(required)) {
      reasons.push(`no-${required}`);
      score += 0.5;
    }
  }

  // 2) Check for a strong negative emotion (score above 0.5)
  const negative = emotions.find(
    (e) => NEGATIVE_EMOTIONS.includes(e.label) && e.score > 0.5,
  );
  if (negative) {
    reasons.push(negative.label);
    score += 0.4;
  }

  // Cap the score at 1
  score = Math.min(score, 1);

  return { level: scoreToLevel(score), score, reasons };
}

// Maps a 0..1 score to a discrete risk level
function scoreToLevel(score: number): RiskLevel {
  if (score >= 0.7) return 'HIGH';
  if (score >= 0.4) return 'MEDIUM';
  return 'LOW';
}
