<img alt="logo" src="./docs/src/assets/cruncher_full_logo.png">

# Cruncher

<img alt="splash" src="./docs/src/assets/splash.png">

Ever wanted to post-process your logs and observability data?
`Cruncher` is here for the rescue!

---

Heavily inspired by observability tools like `Splunk`, `Grafana` and more —
Cruncher lets you query and post-process data from multiple sources using a powerful, easy-to-learn query language.

## Documentation

Full documentation is available at **[cruncher.iamshobe.com](https://cruncher.iamshobe.com)** — including:

- Installation & setup
- Configuration reference
- QQL (Quick Query Language) syntax
- Adapter guides (Loki, Coralogix, Datadog, Docker, Kubernetes, and more)
- Developer guide for building custom adapters

## Quick Start

Download the latest release from the [releases page](https://github.com/IamShobe/cruncher/releases/latest).

### macOS

Extract the zip and move `cruncher.app` to your `Applications` folder. If you encounter a corruption warning, run:

```bash
xattr -cr /Applications/cruncher.app
```
