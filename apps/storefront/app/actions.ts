"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/db";
import { signIn, signOut, auth } from "@/auth";
import { startCheckout } from "@/lib/controlPlane";

const signupSchema = z.object({
  username: z.string().regex(/^[a-z0-9-]{3,40}$/, "username: nur a-z, 0-9, '-', 3–40 Zeichen"),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function signup(formData: FormData) {
  const parsed = signupSchema.safeParse({
    username: String(formData.get("username") ?? "").toLowerCase(),
    email: String(formData.get("email") ?? "").toLowerCase(),
    password: String(formData.get("password") ?? ""),
  });
  if (!parsed.success) redirect("/signup?error=validation");
  const { username, email, password } = parsed.data;

  const exists = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } });
  if (exists) redirect("/signup?error=exists");

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({ data: { email, username, passwordHash, customer: { create: {} } } });
  redirect("/login?registered=1");
}

export async function login(formData: FormData) {
  try {
    await signIn("credentials", {
      email: String(formData.get("email") ?? "").toLowerCase(),
      password: String(formData.get("password") ?? ""),
      redirectTo: "/dashboard",
    });
  } catch (e) {
    if (e instanceof AuthError) redirect("/login?error=1");
    throw e;
  }
}

export async function logout() {
  await signOut({ redirectTo: "/" });
}

export async function checkout(formData: FormData) {
  const session = await auth();
  if (!session) redirect("/login");
  const customerId = (session as { customerId?: string }).customerId;
  const planId = String(formData.get("planId") ?? "");
  if (!customerId) redirect("/dashboard?error=nocustomer");
  const url = await startCheckout(customerId, planId).catch(() => null);
  redirect(url ?? "/dashboard?pending=1");
}
