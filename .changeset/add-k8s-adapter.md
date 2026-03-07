---
"@cruncher/adapter-k8s": minor
---

Add Kubernetes adapter (`@cruncher/adapter-k8s`) that fetches pod logs via `kubectl`.

Features:
- Configurable `kubectl` binary location, context, and namespace
- Pod filtering via `podFilter` substring match
- Multi-container support — each container is queried independently and results are merged in timestamp order
- `toTime` enforced in-process (kubectl has no `--until-time` flag)
- `logPatterns` for regex-based field extraction (same shape as Docker adapter)
- `podOverride` to set a custom `messageFieldName` per pod
- Controller params expose `pod`, `namespace`, `container`, and `phase` dropdowns in the UI
- Output fields: `_time`, `_sortBy`, `_raw`, `ansi_free_line`, `pod`, `podNamespace`, `container`, `phase`, plus any regex capture groups
