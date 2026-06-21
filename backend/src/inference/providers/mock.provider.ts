import { Injectable } from '@nestjs/common';
import {
  FrameInput,
  InferenceProvider,
  InferenceResult,
  Emotion,
  PpeDetection,
} from '../interfaces/inference.interface';
import { computeRisk } from '../risk.calculator';

// Pools the mock can "detect" from
const EMOTION_LABELS = ['happy', 'neutral', 'sad', 'anger', 'fear'];
const PPE_CLASSES = ['helmet', 'vest', 'gloves'];

@Injectable()
export class MockProvider implements InferenceProvider {
  readonly name = 'mock';

  // Deterministic: the same requestId always yields the same result.
  async infer(frame: FrameInput): Promise<InferenceResult> {
    const start = Date.now();
    const seed = hashString(frame.requestId);

    const emotions = this.pickEmotions(seed);
    const ppe = this.pickPpe(seed);
    const risk = computeRisk(emotions, ppe);

    return {
      emotions,
      ppe,
      risk,
      latency_ms: Date.now() - start,
    };
  }

  // Pick one dominant emotion based on the seed
  private pickEmotions(seed: number): Emotion[] {
    const label = EMOTION_LABELS[seed % EMOTION_LABELS.length];
    // Deterministic score in the 0.60..0.95 range
    const score = round(0.6 + (seed % 36) / 100);
    return [{ label, score }];
  }

  // Deterministically include/exclude PPE classes
  private pickPpe(seed: number): PpeDetection[] {
    return PPE_CLASSES.flatMap((cls, i) => {
      // Use a different bit of the seed per class to decide presence
      const present = ((seed >> i) & 1) === 1;
      if (!present) return [];
      const score = round(0.7 + ((seed >> (i + 2)) % 30) / 100);
      const bbox: [number, number, number, number] = [
        seed % 50,
        (seed >> 3) % 50,
        100 + (seed % 60),
        120 + (seed % 60),
      ];
      return [{ class: cls, score, bbox }];
    });
  }
}

// Simple deterministic string hash (djb2). Same string -> same number.
function hashString(input: string): number {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  return Math.abs(hash);
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}
