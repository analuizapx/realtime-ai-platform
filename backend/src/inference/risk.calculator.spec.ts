import { computeRisk } from './risk.calculator';
import { Emotion, PpeDetection } from './interfaces/inference.interface';

describe('computeRisk', () => {
  const helmet: PpeDetection = { class: 'helmet', score: 0.9, bbox: [0, 0, 1, 1] };
  const happy: Emotion = { label: 'happy', score: 0.9 };
  const anger: Emotion = { label: 'anger', score: 0.8 };

  it('returns LOW risk when helmet is present and emotion is positive', () => {
    const risk = computeRisk([happy], [helmet]);
    expect(risk.level).toBe('LOW');
    expect(risk.score).toBe(0);
    expect(risk.reasons).toEqual([]);
  });

  it('raises risk to MEDIUM when the helmet is missing', () => {
    const risk = computeRisk([happy], []);
    expect(risk.reasons).toContain('no-helmet');
    expect(risk.level).toBe('MEDIUM');
  });

  it('returns HIGH risk when helmet is missing AND emotion is anger', () => {
    const risk = computeRisk([anger], []);
    expect(risk.reasons).toContain('no-helmet');
    expect(risk.reasons).toContain('anger');
    expect(risk.level).toBe('HIGH');
  });

  it('ignores a negative emotion with a weak score', () => {
    const weakAnger: Emotion = { label: 'anger', score: 0.2 };
    const risk = computeRisk([weakAnger], [helmet]);
    // Helmet present + weak anger -> no risk factors
    expect(risk.level).toBe('LOW');
    expect(risk.reasons).toEqual([]);
  });

  it('caps the score at 1', () => {
    const risk = computeRisk([anger], []);
    expect(risk.score).toBeLessThanOrEqual(1);
  });
});
