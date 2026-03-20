---
"@cruncher/adapter-docker": major
---

Replace subprocess spawning with Docker Engine HTTP API via dockerode. This eliminates per-query process fork/exec overhead, fixes line buffering bugs that could silently drop log lines spanning chunk boundaries, pre-compiles log pattern regexes, and delivers incremental results as each container completes instead of waiting for all.

BREAKING: The `binaryLocation` param has been removed since the adapter now communicates directly with the Docker socket instead of shelling out to the `docker` CLI binary.
