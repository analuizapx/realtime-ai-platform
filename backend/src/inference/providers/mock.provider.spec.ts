import { MockProvider } from './mock.provider';

describe('MockProvider', () => {
  const provider = new MockProvider();

  it('returns a result in the expected shape', async () => {
    const result = await provider.infer({ requestId: 'abc-123' });
    expect(result).toHaveProperty('emotions');
    expect(result).toHaveProperty('ppe');
    expect(result).toHaveProperty('risk');
    expect(result).toHaveProperty('latency_ms');
    expect(result.risk.level).toMatch(/LOW|MEDIUM|HIGH/);
  });

  it('is deterministic: same requestId yields the same result', async () => {
    const a = await provider.infer({ requestId: 'same-id' });
    const b = await provider.infer({ requestId: 'same-id' });
    // Compare everything except latency (which is timing-based)
    expect(a.emotions).toEqual(b.emotions);
    expect(a.ppe).toEqual(b.ppe);
    expect(a.risk).toEqual(b.risk);
  });

  it('produces different results for different requestIds', async () => {
    const a = await provider.infer({ requestId: 'id-one' });
    const b = await provider.infer({ requestId: 'id-two' });
    // At least one field should differ
    const differs =
      JSON.stringify(a.emotions) !== JSON.stringify(b.emotions) ||
      JSON.stringify(a.ppe) !== JSON.stringify(b.ppe);
    expect(differs).toBe(true);
  });
});
