import * as jose from "jose";

const hashUser = async (user: string) => {
  const hashSecretKey = process.env.NEXT_PUBLIC_HASH_SECRET_KEY;
  if (!hashSecretKey) {
    throw new Error("HASH_SECRET_KEY is not defined");
  }

  // 직접 secret key를 사용
  const encoder = new TextEncoder();
  const secretKey = encoder.encode(hashSecretKey);

  const hashedUser = await new jose.CompactSign(encoder.encode(user))
    .setProtectedHeader({ alg: "HS256" })
    .sign(secretKey);

  return hashedUser;
};

export default hashUser;
