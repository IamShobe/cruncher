# @cruncher/adapter-k8s

## 0.2.1

### Patch Changes

- Updated dependencies [[`c8060e6`](https://github.com/IamShobe/cruncher/commit/c8060e6eb1e610273bded9d7c43628d843848047)]:
  - @cruncher/qql@0.4.0
  - @cruncher/adapter-utils@0.3.2

## 0.2.0

### Minor Changes

- [`111ec6b`](https://github.com/IamShobe/cruncher/commit/111ec6b488abbec0cf95c3b9df9726155edd5dad) Thanks [@IamShobe](https://github.com/IamShobe)! - Add Kubernetes adapter (`@cruncher/adapter-k8s`) that fetches pod logs via `kubectl`.

  Features:
  - Configurable `kubectl` binary location, context, and namespace
  - Pod filtering via `podFilter` substring match
  - Multi-container support — each container is queried independently and results are merged in timestamp order
  - `toTime` enforced in-process (kubectl has no `--until-time` flag)
  - `logPatterns` for regex-based field extraction (same shape as Docker adapter)
  - `podOverride` to set a custom `messageFieldName` per pod
  - Controller params expose `pod`, `namespace`, `container`, and `phase` dropdowns in the UI
  - Output fields: `_time`, `_sortBy`, `_raw`, `ansi_free_line`, `pod`, `podNamespace`, `container`, `phase`, plus any regex capture groups

### Patch Changes

- Updated dependencies [[`3cd20aa`](https://github.com/IamShobe/cruncher/commit/3cd20aadc4ac3e9a70f15ed542a78e7a36c58059)]:
  - @cruncher/qql@0.3.1
  - @cruncher/adapter-utils@0.3.1
