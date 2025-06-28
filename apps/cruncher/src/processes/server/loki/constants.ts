import { resolve } from "node:path";
import { getStateDirPath } from "~lib/state";

export const lokiVersion = "v3.4.4";
export const lokiLocationDir = resolve(getStateDirPath(), "loki");
