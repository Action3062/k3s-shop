import { NextRequest, NextResponse } from "next/server";
import { GATE_COOKIE, verifyGate } from "@/lib/gate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const host =
    req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
  const uri = req.headers.get("x-forwarded-uri") || "/";
  const proto = req.headers.get("x-forwarded-proto") || "https";
  const cookie = req.cookies.get(GATE_COOKIE)?.value;
  if (verifyGate(cookie, host)) {
    return new NextResponse(null, { status: 200 });
  }
  const rd = `${proto}://${host}${uri}`;
  const login = `https://store.meinappnest.org/gate?host=${encodeURIComponent(
    host
  )}&rd=${encodeURIComponent(rd)}`;
  return NextResponse.redirect(login, 302);
}
