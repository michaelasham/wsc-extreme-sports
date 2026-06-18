"use server";

import { redirect } from "next/navigation";
import { createAuthCookie, deleteAuthCookie } from "@/lib/session";

export async function login(
  _prevState: { error?: string } | undefined,
  formData: FormData
): Promise<{ error: string }> {
  const password = formData.get("password")?.toString() ?? "";
  const expected = process.env.APP_PASSWORD;

  if (!expected) throw new Error("APP_PASSWORD env var not set");

  if (password !== expected) {
    return { error: "Incorrect password" };
  }

  await createAuthCookie();
  redirect("/");
}

export async function logout(): Promise<void> {
  await deleteAuthCookie();
  redirect("/login");
}
