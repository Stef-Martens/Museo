const MAX_LOGS = 30;
const logs: string[] = [];
const listeners = new Set<() => void>();

export function authLog(message: string): void {
  const line = `${new Date().toLocaleTimeString()} — ${message}`;
  console.log(`[Museo Auth] ${message}`);
  logs.unshift(line);
  if (logs.length > MAX_LOGS) logs.pop();
  listeners.forEach((fn) => fn());
}

export function getAuthLogs(): string[] {
  return [...logs];
}

export function clearAuthLogs(): void {
  logs.length = 0;
  listeners.forEach((fn) => fn());
}

export function subscribeAuthLogs(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
