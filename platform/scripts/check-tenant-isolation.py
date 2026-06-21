#!/usr/bin/env python3
"""Guardrail: every platform/tenants/tenant-*/ directory must ship the full
isolation set so a hand-created tenant can never reach the cluster without it:
  - a Namespace
  - a default-deny NetworkPolicy (empty podSelector, Ingress+Egress)
  - a ResourceQuota
  - a LimitRange
Filename-agnostic: parses YAML kinds, not file names. Read-only; exits non-zero
with a clear report if anything is missing. Run by CI on PRs touching tenants.
"""
import sys, pathlib, yaml

ROOT = pathlib.Path(__file__).resolve().parents[2]
TENANTS = ROOT / "platform" / "tenants"

def docs_in(d):
    out = []
    for f in sorted(d.glob("*.yaml")):
        try:
            for doc in yaml.safe_load_all(f.read_text(encoding="utf-8")):
                if isinstance(doc, dict):
                    out.append(doc)
        except yaml.YAMLError as e:
            print(f"  ! YAML parse error in {f.relative_to(ROOT)}: {e}")
    return out

def is_default_deny(doc):
    if doc.get("kind") != "NetworkPolicy":
        return False
    spec = doc.get("spec") or {}
    sel = spec.get("podSelector")
    types = set(spec.get("policyTypes") or [])
    return sel == {} and {"Ingress", "Egress"} <= types

def main():
    if not TENANTS.is_dir():
        print(f"FAIL: {TENANTS} not found"); return 1
    tenant_dirs = sorted(p for p in TENANTS.glob("tenant-*") if p.is_dir())
    if not tenant_dirs:
        print("No tenant directories found (nothing to check)."); return 0
    failed = []
    for d in tenant_dirs:
        docs = docs_in(d)
        kinds = [x.get("kind") for x in docs]
        missing = []
        if "Namespace" not in kinds: missing.append("Namespace")
        if not any(is_default_deny(x) for x in docs): missing.append("default-deny NetworkPolicy")
        if "ResourceQuota" not in kinds: missing.append("ResourceQuota")
        if "LimitRange" not in kinds: missing.append("LimitRange")
        status = "OK" if not missing else "MISSING: " + ", ".join(missing)
        print(f"  {d.name}: {status}")
        if missing: failed.append((d.name, missing))
    if failed:
        print("\nFAIL: tenant(s) lack mandatory isolation manifests:")
        for name, m in failed:
            print(f"  - {name}: {', '.join(m)}")
        return 1
    print(f"\nPASS: all {len(tenant_dirs)} tenant(s) carry the full isolation set.")
    return 0

if __name__ == "__main__":
    sys.exit(main())
