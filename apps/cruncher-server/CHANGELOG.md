# cruncher-server

## 0.0.2

### Patch Changes

- [`6a0061f`](https://github.com/IamShobe/cruncher/commit/6a0061f3aa9a27512b30ffa7aae0813388608af5) Thanks [@IamShobe](https://github.com/IamShobe)! - Fix pipeline execution and row count accuracy: use uuidv7 for sortable row IDs, compute row count from actual pipeline results, defer parquet writes for immediate availability, and fix histogram to use pipeline result path.

- Updated dependencies [[`7bc9cd6`](https://github.com/IamShobe/cruncher/commit/7bc9cd64789ed96e123004b0154699577ddd9568)]:
  - @cruncher/adapter-docker@1.0.0

## 0.0.1

### Patch Changes

- Updated dependencies [[`73a494e`](https://github.com/IamShobe/cruncher/commit/73a494e4f16d067dcc82100ac29fa2dcf2e77a4d)]:
  - @cruncher/qql@0.4.5
  - @cruncher/adapter-docker@0.3.7
  - @cruncher/adapter-grafana-loki-browser@0.3.7
  - @cruncher/adapter-coralogix@0.3.7
  - @cruncher/adapter-datadog@0.2.4
  - @cruncher/adapter-k8s@0.2.6
  - @cruncher/adapter-loki@0.2.7
  - @cruncher/adapter-mock@0.5.2
  - @cruncher/adapter-utils@0.5.2
  - @cruncher/server-shared@0.1.1
