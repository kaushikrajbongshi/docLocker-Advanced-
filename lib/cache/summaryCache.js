import redis from "../redis";
const CACHE_EXPIRE = 300;

//SET Cache
export async function setSummaryCache(documentId, data) {
  await redis.set(`summary:${documentId}`, JSON.stringify(data));
  await redis.expire(`summary:${documentId}`, CACHE_EXPIRE);
}

//GET cache
export async function getSummaryCache(documentId) {
  const summary = await redis.get(`summary:${documentId}`);
  if (!summary) return null;
  return JSON.parse(summary);
}

export async function deleteSummaryCache(documentdocumentId) {
  await redis.del(`summary:${documentdocumentId}`);
}