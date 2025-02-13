const hashUser = (user: string) => {
  const base64 = Buffer.from(user).toString("base64");
  const urlSafeHash = base64
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  return urlSafeHash;
};

export default hashUser;
