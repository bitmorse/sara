import { useCallback, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { open } from "@tauri-apps/plugin-dialog";
import { FolderGit2 } from "lucide-react";

import { AppShell } from "@/components/shell/AppShell";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/feedback";
import { IpcProvider } from "@/lib/ipc/context";
import { tauriIpc } from "@/lib/ipc/tauri";
import { createQueryClient } from "@/lib/query/client";

const queryClient = createQueryClient();

/** Prompts for a repo folder, then hands the root to the workbench. */
function ProjectGate() {
  const [root, setRoot] = useState<string | null>(null);

  const pick = useCallback(async () => {
    const selected = await open({ directory: true, multiple: false, title: "Open a SARA project (git repository)" });
    if (typeof selected === "string") setRoot(selected);
  }, []);

  if (!root) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-fg">
        <EmptyState
          icon={FolderGit2}
          title="Open a project"
          description="One project = one git repository = one sara. Choose a repository folder to begin."
          action={<Button variant="primary" icon={FolderGit2} onClick={pick}>Open repository…</Button>}
        />
      </div>
    );
  }

  // Remount AppShell when the root changes so all queries re-key cleanly.
  return <AppShell key={root} root={root} onOpenProject={pick} />;
}

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
