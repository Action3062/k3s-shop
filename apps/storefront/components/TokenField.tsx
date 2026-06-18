"use client";
import { useState } from "react";

export function TokenField({ token }: { token: string }) {
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);
  const masked = token.slice(0, 6) + "•".repeat(20) + token.slice(-4);
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <code className="mono text-[12px] px-3 py-2 rounded-lg bg-surface border border-line2 text-accent-ink break-all flex-1 min-w-[200px]">
        {show ? token : masked}
      </code>
      <button type="button" onClick={() => setShow((v) => !v)} className="btn btn-ghost h-9 px-3 text-[13px]">{show ? "Verbergen" : "Anzeigen"}</button>
      <button type="button" onClick={async () => { await navigator.clipboard.writeText(token); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className="btn btn-ghost h-9 px-3 text-[13px]">{copied ? "Kopiert ✓" : "Kopieren"}</button>
    </div>
  );
}
