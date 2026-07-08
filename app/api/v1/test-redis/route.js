import { addSummaryJob } from "@/lib/bullmq/producers/summary.producer";
import { NextResponse } from "next/server";
// import redis from "@/lib/redis";
// import { test } from "@/middleware/rateLimiter";
// export async function GET() {
//   const limit = await test.consume(5);
//   console.log(limit);

//   const cachedValue = await redis.get("todo");

//   if (cachedValue) return NextResponse.json(JSON.parse(cachedValue));

//   const res = await fetch("https://jsonplaceholder.typicode.com/todos");
//   const data = await res.json();

//   await redis.set("todo", JSON.stringify(data));

//   await redis.expire("todo", 30);

//   // await redis.set("name:5", "kaushik");
//   // const value = await redis.mget("name:5", "name:2");

//   return NextResponse.json({
//     data,
//   });
// }

export async function GET(params) {
  const id = "1djfg7dsjfoiejod7fe9787078n11"
  await addSummaryJob(id);

  return NextResponse.json({
    success: true,
    message: "Summary job added.",
  });
}
