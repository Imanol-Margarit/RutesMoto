import argon2 from "argon2";

export async function hashPassword(password) {
  return argon2.hash(password, { type: argon2.argon2id });
}

export async function verifyPassword(password, storedHash) {
  try {
    return await argon2.verify(storedHash, password);
  } catch {
    return false;
  }
}