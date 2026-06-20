import Link from "next/link";
import type { ServiceInstance } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";

export function ServiceCard({ s }: { s: ServiceInstance }) {
  const running = s.status === "RUNNING";
  return (
    <div className="card card-hover flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="chip h-11 w-11">{s.name.charAt(0)}</span>
          <div className="min-w-0">
            <b className="text-[15px] block truncate">{s.name}</b>
            <p className="mono text-[11px] text-faint uppercase tracking-wider">{s.appSlug}</p>
          </div>
        </div>
        <StatusBadge status={s.status} />
      </div>
      <a href={s.url} target="_blank" rel="noopener" className="block mono text-[13px] text-accent-ink mt-4 hover:underline truncate">{s.url}</a>
      <div className="flex gap-2 mt-5 pt-4 border-t border-line">
        {running
          ? <a href={s.url} target="_blank" rel="noopener" className="btn btn-primary h-9 px-4 text-[14px]">Öffnen ↗</a>
          : <span className="btn btn-ghost h-9 px-4 text-[14px] opacity-60 cursor-not-allowed">Öffnen ↗</span>}
        <Link href={`/dashboard/apps/${s.id}`} className="btn btn-ghost h-9 px-4 text-[14px]">Verwalten</Link>
      </div>
    </div>
  );
}
