// Utility for IPC type guards
export function isIpcMessage(
  msg: unknown,
): msg is { type: string; [key: string]: unknown } {
  return typeof msg === "object" && msg !== null && "type" in msg;
}
