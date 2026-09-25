/** Light client-only UI state (selection, panels). Server state lives in Query. */

import { create } from "zustand";

export type MainView = "document" | "traceability" | "reports";
export type RightPanel = "inspector" | "history" | "none";
export type LeftTab = "outline" | "files" | "source-control";

interface UiState {
  selectedItemId: string | null;
  mainView: MainView;
  rightPanel: RightPanel;
  leftTab: LeftTab;
  editing: boolean;
  /** The Inspector dock is hidden by default (noise while reading). */
  inspectorCollapsed: boolean;

  select: (id: string | null) => void;
  setMainView: (v: MainView) => void;
  setRightPanel: (p: RightPanel) => void;
  setLeftTab: (t: LeftTab) => void;
  setEditing: (editing: boolean) => void;
  toggleInspector: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  selectedItemId: null,
  mainView: "document",
  rightPanel: "inspector",
  leftTab: "outline",
  editing: false,
  inspectorCollapsed: true,

  select: (id) => set({ selectedItemId: id }),
  setMainView: (v) => set({ mainView: v }),
  setRightPanel: (p) => set({ rightPanel: p }),
  setLeftTab: (t) => set({ leftTab: t }),
  setEditing: (editing) => set({ editing }),
  toggleInspector: () => set((s) => ({ inspectorCollapsed: !s.inspectorCollapsed })),
}));
