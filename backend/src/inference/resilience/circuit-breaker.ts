import { Logger } from '@nestjs/common';

// Circuit breaker states:
//  - CLOSED: everything works, calls go through
//  - OPEN: too many failures, calls are blocked immediately (fail fast)
//  - HALF_OPEN: cooldown passed, allow ONE trial call to test recovery
export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerOptions {
  failureThreshold: number; // failures before opening the circuit
  cooldownMs: number; // how long to stay OPEN before testing again
}

/**
 * Minimal circuit breaker. Wraps an async operation and stops calling it
 * after repeated failures, giving the downstream system time to recover.
 */
export class CircuitBreaker {
  private readonly logger = new Logger(CircuitBreaker.name);
  private state: CircuitState = 'CLOSED';
  private failureCount = 0;
  private openedAt = 0;

  constructor(private readonly options: CircuitBreakerOptions) {}

  getState(): CircuitState {
    return this.state;
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    // If OPEN, check whether the cooldown has elapsed
    if (this.state === 'OPEN') {
      const elapsed = Date.now() - this.openedAt;
      if (elapsed < this.options.cooldownMs) {
        // Still cooling down: fail fast without calling the operation
        throw new Error('Circuit breaker is OPEN — refusing call');
      }
      // Cooldown passed: allow a single trial call
      this.state = 'HALF_OPEN';
      this.logger.warn('Circuit breaker entering HALF_OPEN (trial call)');
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (err) {
      this.onFailure();
      throw err;
    }
  }

  private onSuccess(): void {
    // A success resets everything back to normal
    this.failureCount = 0;
    if (this.state !== 'CLOSED') {
      this.logger.log('Circuit breaker recovered — back to CLOSED');
    }
    this.state = 'CLOSED';
  }

  private onFailure(): void {
    this.failureCount++;
    // A failure during a trial call (or enough failures) opens the circuit
    if (
      this.state === 'HALF_OPEN' ||
      this.failureCount >= this.options.failureThreshold
    ) {
      this.state = 'OPEN';
      this.openedAt = Date.now();
      this.logger.error(
        `Circuit breaker OPEN after ${this.failureCount} failures`,
      );
    }
  }
}
