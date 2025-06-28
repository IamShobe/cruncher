import os from "node:os";
import path from "node:path";
import fs from "node:fs";
import { pipeline } from "node:stream";
import { promisify } from "node:util";
import { extractZip } from "~lib/zip";

const streamPipeline = promisify(pipeline);

function getLokiFilename() {
  const platform = os.platform();
  const arch = os.arch();

  let plat;
  if (platform === "win32") plat = "windows";
  else if (platform === "darwin") plat = "darwin";
  else if (platform === "linux") plat = "linux";
  else throw new Error(`Unsupported platform: ${platform}`);

  let archMapped;
  if (arch === "x64") archMapped = "amd64";
  else if (arch === "arm64") archMapped = "arm64";
  else throw new Error(`Unsupported architecture: ${arch}`);

  // Windows adds `.exe` in the zip filename
  const ext = platform === "win32" ? ".exe.zip" : ".zip";

  return `loki-${plat}-${archMapped}${ext}`;
}

function getLokiDownloadUrl(version: string) {
  const filename = getLokiFilename();
  return `https://github.com/grafana/loki/releases/download/${version}/${filename}`;
}

export function getBinaryName() {
  const filename = getLokiFilename();
  return path.basename(filename, ".zip");
}

export async function downloadLoki(version: string, targetDir: string) {
  const filename = getLokiFilename();
  const lokiBinaryName = getBinaryName();
  const url = getLokiDownloadUrl(version);

  console.log(`Downloading Loki from: ${url}`);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download Loki: ${response.statusText}`);
  }

  if (!response.body) {
    throw new Error("Response body is null");
  }

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const filePath = path.join(targetDir, filename);
  await streamPipeline(response.body, fs.createWriteStream(filePath));
  console.log(`Loki downloaded to: ${filePath}`);

  console.log(`Extracting ${filePath} to ${targetDir}...`);
  await extractZip(filePath, targetDir);

  console.log(`Loki extracted to: ${targetDir}`);
  // Clean up the downloaded zip file
  fs.unlinkSync(filePath);

  // Move the loki binary to the targetDir
  const lokiBinaryPath = path.join(targetDir, lokiBinaryName);
  if (!fs.existsSync(lokiBinaryPath)) {
    throw new Error(
      `Loki binary not found at expected path: ${lokiBinaryPath}`,
    );
  }

  // Optional: make binary executable on POSIX systems
  if (os.platform() !== "win32") {
    fs.chmodSync(lokiBinaryPath, 0o755);
  }

  console.log("Loki is ready.");
}
