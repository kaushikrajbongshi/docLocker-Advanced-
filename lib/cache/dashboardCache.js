import redis from "../redis";

const CACHE_EXPIRE = 300;

// Helper function
function getDashboardCacheKey(userId, page, limit) {
  return `dashboard:${userId}:page:${page}:limit:${limit}`;
}

// Get Cache
export async function getDashboardCache(userId, page, limit) {
  const cacheKey = getDashboardCacheKey(userId, page, limit);

  const cacheValue = await redis.get(cacheKey);

  if (!cacheValue) return null;

  return JSON.parse(cacheValue);
}

// Set Cache
export async function setDashboardCache(userId, page, limit, data) {
  const cacheKey = getDashboardCacheKey(userId, page, limit);

  await redis.set(cacheKey, JSON.stringify(data));
  await redis.expire(cacheKey, CACHE_EXPIRE);

  // Store the cache key for future invalidation
  await redis.sadd(`dashboard_keys:${userId}`, cacheKey);
  await redis.expire(`dashboard_keys:${userId}`, CACHE_EXPIRE);
}

//for deletion
export async function invalidateDashboardCache(userId) {
  const setKey = `dashboard_keys:${userId}`;

  // Get all dashboard cache keys
  const cacheKeys = await redis.smembers(setKey);

  // Delete all cached dashboard pages
  if (cacheKeys.length > 0) {
    await redis.del(...cacheKeys);
  }

  // Delete the set itself
  await redis.del(setKey);
}

