import redis from "./redis";

const OTP_EXPIRE = 300;

//save OTP
export async function saveOTP(userId, hashOtp, type) {
  await redis.hset(`otp:${userId}`, {
    code: hashOtp,
    type,
  });

  redis.expire(`otp:${userId}`, OTP_EXPIRE);
}

//get OTP
export async function getOTP(userId) {
  const otp = await redis.hgetall(`otp:${userId}`);
  if (!otp || Object.keys(otp).length === 0) return null;
  return otp;
}

//delete otp
export async function deleteOTP(userId) {
  await redis.del(`otp:${userId}`);
}
