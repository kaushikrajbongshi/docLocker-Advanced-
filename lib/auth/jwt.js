import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET;

if (!SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

export const generateToken = (payload) => {
  return jwt.sign(payload, SECRET, {
    expiresIn: "12h",
  });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    throw new Error("Invalid or expired token");
  }
};