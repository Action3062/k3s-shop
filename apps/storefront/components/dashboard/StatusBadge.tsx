import { INSTANCE_STATUS, SUBSCRIPTION_STATUS, type InstanceStatus, type SubscriptionStatus } from "@/lib/dashboard";

export function StatusBadge({ status, kind = "instance" }: { status: string; kind?: "instance" | "subscription" }) {
  const meta = kind === "subscription"
    ? SUBSCRIPTION_STATUS[status as SubscriptionStatus]
    : INSTANCE_STATUS[status as InstanceStatus];
  if (!meta) return null;
  const pulse = "pulse" in meta && (meta as { pulse?: boolean }).pulse;
  return (
    <span className="pill h-7 text-[12px] font-semibold" role="status" aria-label={`Status: ${meta.label}`}>
      <span className={`dot ${pulse ? "pulse-soft" : ""}`} style={{ background: meta.color, boxShadow: `0 0 8px ${meta.color}` }} />
      {meta.label}
    </span>
  );
}
