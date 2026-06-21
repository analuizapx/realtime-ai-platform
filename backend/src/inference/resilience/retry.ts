// Rejects if the operation takes longer than `ms` milliseconds.
export function withTimeout<T>(
  operation: () => Promise<T>,
  ms: number,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`Operation timed out after ${ms}ms`)),
      ms,
    );
    operation().then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}

// Retries the operation up to `attempts` times before giving up.
export async function withRetry<T>(
  operation: () => Promise<T>,
  attempts: number,
): Promise<T> {
  let lastError: unknown;
  for (let i = 1; i <= attempts; i++) {
    try {
      return await operation();
    } catch (err) {
      lastError = err;
      // Try again unless this was the last attempt
    }
  }
  throw lastError;
}
