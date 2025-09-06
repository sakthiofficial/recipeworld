// Simple in-memory rate limiting
const requestCounts = new Map<string, { count: number; resetTime: number }>();

interface RateLimitOptions {
  windowMs: number;
  uniqueTokenPerInterval?: number;
}

export function rateLimit(options: RateLimitOptions) {
  const windowMs = options.windowMs;

  return function checkRateLimit(identifier: string): boolean {
    const now = Date.now();
    const record = requestCounts.get(identifier);

    if (!record || now > record.resetTime) {
      // Reset the counter for this identifier
      requestCounts.set(identifier, {
        count: 1,
        resetTime: now + windowMs,
      });
      return true;
    }

    if (record.count >= (options.uniqueTokenPerInterval || 10)) {
      return false; // Rate limit exceeded
    }

    // Increment the counter
    record.count++;
    return true;
  };
}
