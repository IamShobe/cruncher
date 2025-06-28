import fs from "fs";

export function acquireLock(lockFilePath: string): boolean {
  if (fs.existsSync(lockFilePath)) {
    const pid = parseInt(fs.readFileSync(lockFilePath, "utf8"));
    try {
      process.kill(pid, 0); // check if process is alive
      console.log("Loki is being managed by process", pid);
      return false;
    } catch (e) {
      // Process doesn't exist
      console.log("Stale lock file found. Proceeding...");
    }
  }

  fs.writeFileSync(lockFilePath, process.pid.toString());
  process.on("exit", () => fs.unlinkSync(lockFilePath));
  return true;
}
