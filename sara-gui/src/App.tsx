import { QueryClientProvider } from "@tanstack/react-query";

import { ProjectGate } from "@/components/project/ProjectGate";
import { IpcProvider } from "@/lib/ipc/context";
import { tauriIpc } from "@/lib/ipc/tauri";
import { createQueryClient } from "@/lib/query/client";

const queryClient = createQueryClient();

/** Root of the desktop app: real Tauri IPC + query cache + project gate. */
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <IpcProvider client={tauriIpc}>
        <ProjectGate />
      </IpcProvider>
    </QueryClientProvider>
  );
}
