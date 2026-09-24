/**
 * Dependency-injection seam for the IPC client.
 *
 * `useIpc()` returns whichever implementation the nearest provider supplies:
 * `IpcProvider` (real Tauri) in the app, `MockIpcProvider` in Storybook/tests.
 * This is why every Tauri-backed component renders outside a Tauri runtime.
 */

import { createContext, use, type ReactNode } from "react";

import type { IpcClient } from "./contract";
import { createMockIpc, mockIpc, type MockOptions } from "./mock";

const IpcContext = createContext<IpcClient | null>(null);

export function IpcProvider({ client, children }: { client: IpcClient; children: ReactNode }) {
  return <IpcContext value={client}>{children}</IpcContext>;
}

/** Storybook/test provider — wraps children with a fixture-backed client. */
export function MockIpcProvider({
  children,
  ...options
}: MockOptions & { children: ReactNode }) {
  const client = Object.keys(options).length ? createMockIpc(options) : mockIpc;
  return <IpcContext value={client}>{children}</IpcContext>;
}

export function useIpc(): IpcClient {
  const client = use(IpcContext);
  if (!client) throw new Error("useIpc must be used within an IpcProvider");
  return client;
}
