import fs from "node:fs";
import { resolve } from "node:path";
import { configLocation, initializeConfig } from "./config";
import { lokiLocationDir, lokiVersion } from "./constants";
import { downloadLoki, getBinaryName } from "./downloader";
import { spawn } from "node:child_process";
import { acquireLock } from "~lib/procLock";
import { CruncherLokiConfig } from "../config/schema";
import winston from "winston";
import "winston-daily-rotate-file";

const lockFilePath = resolve(lokiLocationDir, "loki.lock");
const lokiPidFilePath = resolve(lokiLocationDir, "loki.pid");

export const ensureBinaryExists = async () => {
  const binaryName = getBinaryName();
  const binaryPath = resolve(lokiLocationDir, binaryName);
  if (!fs.existsSync(binaryPath)) {
    await downloadLoki(lokiVersion, lokiLocationDir);
  }
};

const readPidFromFile = (pidFilePath: string): number | null => {
  try {
    if (fs.existsSync(pidFilePath)) {
      const pid = parseInt(fs.readFileSync(pidFilePath, "utf8"));
      if (!isNaN(pid)) {
        try {
          process.kill(pid, 0); // Check if the process is alive
          return pid; // Process is alive, return its PID
        } catch (e) {
          // Process doesn't exist, return null
          console.log(
            "Stale PID file found. Proceeding to start a new Loki instance.",
          );
          return null;
        }
      }
    }
  } catch (error) {
    console.error("Error reading PID file:", error);
  }

  return null; // PID file doesn't exist or contains invalid data
};

const startLoki = () => {
  if (!acquireLock(lockFilePath)) {
    throw new Error("Failed to acquire lock for Loki");
  }

  const lokiLogger = winston.createLogger({
    level: "info",
    format: winston.format.json(),
    defaultMeta: { service: "loki" },
    transports: [
      new winston.transports.DailyRotateFile({
        filename: "loki-combined-%DATE%.log",
        dirname: lokiLocationDir,
        datePattern: "YYYY-MM-DD",
        zippedArchive: true,
        maxSize: "20m",
        maxFiles: "4",
      }),
    ],
  });

  const existingPid = readPidFromFile(lokiPidFilePath);
  if (existingPid) {
    // kill the existing Loki process
    try {
      process.kill(existingPid, "SIGTERM");
      console.log(`Killed existing Loki process with PID: ${existingPid}`);
    } catch (error) {
      console.error(
        `Failed to kill existing Loki process with PID ${existingPid}:`,
        error,
      );
    }
  }

  console.log("Starting Loki process...");
  const binaryName = getBinaryName();
  const binaryPath = resolve(lokiLocationDir, binaryName);
  const lokiProcess = spawn(binaryPath, ["-config.file", configLocation]);

  lokiProcess.stderr.setEncoding("utf8");
  lokiProcess.stderr.on("data", (error) => {
    lokiLogger.error(error);
  });
  lokiProcess.stdout.setEncoding("utf8");
  lokiProcess.stdout.on("data", (data) => {
    lokiLogger.info(data);
  });

  lokiProcess.on("error", (error) => {
    console.error("Failed to start Loki process:", error);
  });
  lokiProcess.on("exit", (code) => {
    if (code !== 0) {
      console.error(`Loki process exited with code: ${code}`);
    } else {
      console.log("Loki process started successfully.");
    }
  });

  process.on("exit", () => {
    lokiProcess.kill();
    console.log("Loki process killed on exit.");
  });

  lokiProcess.on("spawn", () => {
    fs.writeFileSync(lokiPidFilePath, lokiProcess.pid!.toString());
  });

  return lokiProcess;
};

export const init = async (config?: CruncherLokiConfig) => {
  const actualConfig: CruncherLokiConfig = config ?? {
    enabled: false,
    listenPort: 43100,
  };

  if (!actualConfig.enabled) {
    console.log("Loki is disabled in the configuration.");
    return;
  }

  try {
    console.log("Initializing Loki...", lokiVersion);
    await ensureBinaryExists();
    const config = await initializeConfig(actualConfig);
    startLoki();
    const port = config.server.http_listen_port;
    console.log(`Loki initialized and listening on port ${port}`);

    // check if loki is already initialized using health check
  } catch (error) {
    console.error("Failed initializing Loki binary:", error);
  }
};
