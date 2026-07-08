// cacheSummary
export async function cacheSummary(id, finalResponse) {
  console.log("Job: add in cache");

  await setSummaryCache(id, finalResponse);
}
