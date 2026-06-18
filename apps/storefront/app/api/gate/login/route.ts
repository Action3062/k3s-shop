import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { GATE_COOKIE, signGate } from "@/lib/gate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeHost(h: string) {
  return /^[a-z0-9.-]+\.meinappnest\.org$/i.test(h);
}

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const host = String(form.get("host") || "").trim();
  const token = String(form.get("token") || "").trim();
  const rd = String(form.get("rd") || "").trim();

  const fail = (msg: string) =>
    NextResponse.redirect(
      `https://store.meinappnest.org/gate?host=${encodeURIComponent(
        host
      )}&rd=${encodeURIComponent(rd)}&error=${encodeURIComponent(msg)}`,
      302
    );

  if (!safeHost(host)) return fail("badhost");
  const subdomain = host.replace(/\.meinappnest\.org$/i, "");
  const inst = await prisma.serviceInstance.findUnique({ where: { subdomain } });
  if (!inst || !inst.gatewayToken) return fail("notfound");

  const a = Buffer.from(token);
  const b = Buffer.from(inst.gatewayToken);
  const ok = a.length === b.length && crypto.timingSafeEqual(a, b);
  if (!ok) return fail("denied");

  let target = `https://${host}/`;
  if (rd && rd.startsWith(`https://${host}/`)) target = rd;
  try {
    if (inst.appSlug === "openclaw" && new URL(target).pathname === "/") {
      target += `#token=${inst.gatewayToken}`;
    }
  } catch {}

  const res = NextResponse.redirect(target, 302);
  res.cookies.set(GATE_COOKIE, signGate(host), {
    domain: ".meinappnest.org",
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 12 * 60 * 60,
  });
  return res;
}
