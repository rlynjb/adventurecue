/**
 * Add rate limiting between API calls
 */
export const rateLimitDelay = async (ms: number = 200): Promise<void> => {
  await new Promise((r) => setTimeout(r, ms));
};

/**
 * Create a rate limiter function
 */
export const createRateLimiter = (ms: number) => {
  return () => rateLimitDelay(ms);
};