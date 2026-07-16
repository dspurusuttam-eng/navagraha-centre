// Claude Admin Console C3A1 — deterministic in-memory login rate limiter (pure).
// Keyed by an opaque identifier (e.g. client IP). Injected clock → fully testable.
export type RateLimitResult = { allowed: boolean; remaining: number; retryAfterMs: number };

type RateLimitState = { attempts: number; windowStart: number; blockedUntil: number };

export type LoginRateLimiter = {
  check(key: string, now: number): RateLimitResult;
  recordFailure(key: string, now: number): void;
  reset(key: string): void;
};

export type LoginRateLimiterOptions = {
  maxAttempts: number; // failures allowed within the window before blocking
  windowMs: number; // sliding failure window
  blockMs: number; // lockout duration once maxAttempts is exceeded
};

export function createLoginRateLimiter(options: LoginRateLimiterOptions): LoginRateLimiter {
  const store = new Map<string, RateLimitState>();

  function currentState(key: string, now: number): RateLimitState {
    const existing = store.get(key);
    if (!existing) return { attempts: 0, windowStart: now, blockedUntil: 0 };
    // Expire the failure window once it has fully elapsed (and no active block).
    if (existing.blockedUntil <= now && now - existing.windowStart > options.windowMs) {
      return { attempts: 0, windowStart: now, blockedUntil: 0 };
    }
    return existing;
  }

  return {
    check(key, now) {
      const state = currentState(key, now);
      if (state.blockedUntil > now) {
        return { allowed: false, remaining: 0, retryAfterMs: state.blockedUntil - now };
      }
      const remaining = Math.max(0, options.maxAttempts - state.attempts);
      return { allowed: remaining > 0, remaining, retryAfterMs: 0 };
    },
    recordFailure(key, now) {
      const base = currentState(key, now);
      const attempts = base.attempts + 1;
      const blockedUntil = attempts >= options.maxAttempts ? now + options.blockMs : base.blockedUntil;
      store.set(key, { attempts, windowStart: base.windowStart, blockedUntil });
    },
    reset(key) {
      store.delete(key);
    },
  };
}
