import { RateLimiterMemory, RateLimiterQueue } from 'rate-limiter-flexible';

const rateLimiter = new RateLimiterMemory({
  points: 4,
  duration: 1,
});
export const limitQueue = new RateLimiterQueue(rateLimiter);
