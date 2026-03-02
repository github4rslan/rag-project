const { Redis } = require("@upstash/redis");

const redis = new Redis({
  url:   process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Cache expiry times
const CACHE_TTL = {
  CHAT:      60 * 60,      // 1 hour
  EMBEDDING: 60 * 60 * 24, // 24 hours
  DOCUMENTS: 60 * 5,       // 5 minutes
};

/**
 * Generate a consistent cache key
 */
function makeCacheKey(...parts) {
  return parts.join(":").replace(/\s+/g, "_").toLowerCase();
}

/**
 * Get value from cache
 */
async function getCache(key) {
  try {
    const data = await redis.get(key);
    if (data) {
      console.log(`⚡ Cache HIT: ${key}`);
      return data;
    }
    console.log(`❌ Cache MISS: ${key}`);
    return null;
  } catch (err) {
    console.error("Cache get error:", err);
    return null; // fail silently
  }
}

/**
 * Set value in cache
 */
async function setCache(key, value, ttl = CACHE_TTL.CHAT) {
  try {
    await redis.setex(key, ttl, JSON.stringify(value));
    console.log(`✅ Cache SET: ${key} (${ttl}s)`);
  } catch (err) {
    console.error("Cache set error:", err);
    // fail silently — app still works without cache
  }
}

/**
 * Delete a cache key
 */
async function deleteCache(key) {
  try {
    await redis.del(key);
    console.log(`🗑 Cache DELETE: ${key}`);
  } catch (err) {
    console.error("Cache delete error:", err);
  }
}

/**
 * Delete all cache keys matching a pattern
 * e.g. deletePattern("docs:userId123:*")
 */
async function deletePattern(pattern) {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await Promise.all(keys.map((k) => redis.del(k)));
      console.log(`🗑 Cache DELETE pattern: ${pattern} (${keys.length} keys)`);
    }
  } catch (err) {
    console.error("Cache delete pattern error:", err);
  }
}

module.exports = {
  getCache,
  setCache,
  deleteCache,
  deletePattern,
  makeCacheKey,
  CACHE_TTL,
};