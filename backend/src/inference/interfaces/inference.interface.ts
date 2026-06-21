// ----- Inference result contract (matches the spec in the test) -----
// This is the shape EVERY provider (mock, ONNX, Azure...) must return.
// Keeping it in one place is what lets us swap providers without breaking callers.

export interface Emotion {
  label: string; // e.g. "happy", "anger"
  score: number; // 0..1 confidence
}

export interface PpeDetection {
  class: string; // e.g. "helmet", "vest"
  score: number; // 0..1 confidence
  bbox: [number, number, number, number]; // [x, y, width, height]
}

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Risk {
  level: RiskLevel;
  score: number; // 0..1
  reasons: string[]; // e.g. ["no-helmet", "anger"]
}

export interface InferenceResult {
  emotions: Emotion[];
  ppe: PpeDetection[];
  risk: Risk;
  latency_ms: number;
}

// Input sent to POST /inference/frames
export interface FrameInput {
  requestId: string; // used for idempotency
  frameId?: string;
  // In a real system this would carry the image; here it's optional metadata
  imageRef?: string;
}

// ----- Provider Pattern -----
// Any inference engine must implement this single method.
// Swapping the mock for a real model = writing a new class that implements this.
export interface InferenceProvider {
  readonly name: string;
  infer(frame: FrameInput): Promise<InferenceResult>;
}
