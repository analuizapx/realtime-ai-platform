import { CircuitBreaker } from './circuit-breaker';

describe('CircuitBreaker', () => {
  const ok = () => Promise.resolve('ok');
  const fail = () => Promise.reject(new Error('boom'));

  it('starts CLOSED and passes successful calls through', async () => {
    const breaker = new CircuitBreaker({ failureThreshold: 3, cooldownMs: 100 });
    await expect(breaker.execute(ok)).resolves.toBe('ok');
    expect(breaker.getState()).toBe('CLOSED');
  });

  it('opens after reaching the failure threshold', async () => {
    const breaker = new CircuitBreaker({ failureThreshold: 3, cooldownMs: 100 });
    // 3 failures should trip the breaker
    for (let i = 0; i < 3; i++) {
      await expect(breaker.execute(fail)).rejects.toThrow();
    }
    expect(breaker.getState()).toBe('OPEN');
  });

  it('fails fast while OPEN (without calling the operation)', async () => {
    const breaker = new CircuitBreaker({ failureThreshold: 1, cooldownMs: 1000 });
    await expect(breaker.execute(fail)).rejects.toThrow(); // trips open
    expect(breaker.getState()).toBe('OPEN');

    // Next call should be refused by the breaker, not by the operation
    await expect(breaker.execute(ok)).rejects.toThrow(/OPEN/);
  });

  it('recovers to CLOSED after a successful trial call', async () => {
    const breaker = new CircuitBreaker({ failureThreshold: 1, cooldownMs: 10 });
    await expect(breaker.execute(fail)).rejects.toThrow(); // open
    // Wait out the cooldown so the breaker allows a trial call
    await new Promise((r) => setTimeout(r, 20));
    await expect(breaker.execute(ok)).resolves.toBe('ok'); // HALF_OPEN -> success
    expect(breaker.getState()).toBe('CLOSED');
  });
});
