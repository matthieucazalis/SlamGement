import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export class EmailTakenError extends Error {}

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
}) {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });
  if (existing) throw new EmailTakenError();

  const passwordHash = await bcrypt.hash(input.password, 12);
  return prisma.user.create({
    data: { name: input.name, email: input.email, passwordHash },
    select: { id: true, email: true, name: true },
  });
}

export async function verifyCredentials(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return null;
  return { id: user.id, email: user.email, name: user.name };
}

export class WrongPasswordError extends Error {}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, createdAt: true },
  });
}

export async function updateProfile(userId: string, name: string) {
  return prisma.user.update({ where: { id: userId }, data: { name } });
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new WrongPasswordError();

  const ok = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!ok) throw new WrongPasswordError();

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
}
