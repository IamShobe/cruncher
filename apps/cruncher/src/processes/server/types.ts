// Define a type for IPC messages
export interface IPCMessage {
  type: string;
  [key: string]: unknown;
}
