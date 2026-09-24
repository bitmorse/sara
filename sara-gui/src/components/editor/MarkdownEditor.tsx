import { useCallback } from "react";
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  linkPlugin,
  linkDialogPlugin,
  imagePlugin,
  tablePlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  diffSourcePlugin,
  markdownShortcutPlugin,
  toolbarPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  CreateLink,
  InsertImage,
  InsertTable,
  InsertThematicBreak,
  ListsToggle,
  CodeToggle,
  InsertCodeBlock,
  DiffSourceToggleWrapper,
  Separator,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";

import { cn } from "@/lib/cn";
import { useIpc } from "@/lib/ipc/context";
import { useIsDark } from "@/lib/use-theme";

export interface MarkdownEditorProps {
  /** The item whose body is being edited — scopes asset resolution/uploads. */
  itemId: string;
  /** Initial markdown BODY (frontmatter is owned by core, never shown here). */
  value: string;
  onChange?: (markdown: string) => void;
  readOnly?: boolean;
  className?: string;
}

/**
 * MDXEditor wrapper for a requirement's markdown body.
 *
 * Contract: this editor NEVER sees frontmatter — the backend splits it out and
 * recombines on save, so git diffs stay clean. Local images/videos are stored
 * as repo-relative paths; `imagePreviewHandler` resolves them to an asset URL
 * for display only, and pasted/dropped images are written into the repo working
 * tree via `savePastedAsset`, returning the relative path to embed.
 */
export function MarkdownEditor({ itemId, value, onChange, readOnly, className }: MarkdownEditorProps) {
  const ipc = useIpc();
  const isDark = useIsDark();

  const imageUploadHandler = useCallback(
    async (file: File) => {
      const bytes = new Uint8Array(await file.arrayBuffer());
      return ipc.savePastedAsset(itemId, file.name, bytes);
    },
    [ipc, itemId],
  );

  const imagePreviewHandler = useCallback(
    (src: string) => {
      // Absolute/remote URLs pass through; repo-relative paths get resolved.
      if (/^(https?:|data:|blob:|asset:)/.test(src)) return Promise.resolve(src);
      return ipc.resolveAssetUrl(itemId, src);
    },
    [ipc, itemId],
  );

  return (
    <div className={cn("sara-mdx", isDark && "dark-theme dark-editor", className)}>
      <MDXEditor
        markdown={value}
        readOnly={readOnly}
        onChange={onChange}
        contentEditableClassName="sara-prose"
        plugins={[
          headingsPlugin(),
          listsPlugin(),
          quotePlugin(),
          thematicBreakPlugin(),
          linkPlugin(),
          linkDialogPlugin(),
          imagePlugin({ imageUploadHandler, imagePreviewHandler }),
          tablePlugin(),
          codeBlockPlugin({ defaultCodeBlockLanguage: "" }),
          codeMirrorPlugin({
            codeBlockLanguages: {
              "": "Plain text",
              ts: "TypeScript",
              js: "JavaScript",
              rust: "Rust",
              bash: "Shell",
              yaml: "YAML",
              json: "JSON",
              mermaid: "Mermaid",
            },
          }),
          diffSourcePlugin({ viewMode: "rich-text" }),
          markdownShortcutPlugin(),
          toolbarPlugin({
            toolbarContents: () => (
              <DiffSourceToggleWrapper>
                <UndoRedo />
                <Separator />
                <BoldItalicUnderlineToggles />
                <CodeToggle />
                <Separator />
                <BlockTypeSelect />
                <ListsToggle />
                <Separator />
                <CreateLink />
                <InsertImage />
                <InsertTable />
                <InsertThematicBreak />
                <InsertCodeBlock />
              </DiffSourceToggleWrapper>
            ),
          }),
        ]}
      />
    </div>
  );
}
