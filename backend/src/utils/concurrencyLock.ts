/**
 * Appointment Concurrency Lock Service
 * Guarantees atomic reservation check and double-booking race condition prevention.
 */
class ConcurrencyLockManager {
  private activeLocks = new Map<string, number>();

  /**
   * Tries to acquire an exclusive lock for a resource key.
   * @param resourceKey Unique lock key (e.g. `slot:doc-001:2026-09-02:10:30 AM`)
   * @param timeoutMs Maximum duration the lock can be held before automatic expiration (default: 5000ms)
   * @returns A release function to be called in a `finally` block, or null if lock could not be acquired.
   */
  public async acquire(resourceKey: string, timeoutMs: number = 5000): Promise<(() => void) | null> {
    const now = Date.now();
    const existingLockTime = this.activeLocks.get(resourceKey);

    // If lock exists and has not expired, resource is currently contested
    if (existingLockTime && now - existingLockTime < timeoutMs) {
      return null;
    }

    // Set lock timestamp
    this.activeLocks.set(resourceKey, now);

    // Return release handle
    let released = false;
    return () => {
      if (!released) {
        released = true;
        this.activeLocks.delete(resourceKey);
      }
    };
  }

  /**
   * Helper to execute work inside an exclusive lock.
   * Throws 409 conflict error if resource is currently being locked by a concurrent request.
   */
  public async withLock<T>(resourceKey: string, work: () => Promise<T>, conflictErrorMsg?: string): Promise<T> {
    const release = await this.acquire(resourceKey);
    if (!release) {
      const err: any = new Error(conflictErrorMsg || 'A booking operation is currently in progress for this slot. Please try again.');
      err.statusCode = 409;
      throw err;
    }

    try {
      return await work();
    } finally {
      release();
    }
  }
}

export const concurrencyLock = new ConcurrencyLockManager();
