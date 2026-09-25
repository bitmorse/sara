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
  frontmatterPlugin,
  markdownShortcutPlugin,
  toolbarPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  CreateLink,
  InsertImage,
  ListsToggle,
  InsertCodeBlock,
  InsertFrontmatter,
  DiffSourceToggleWrapper,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";

import { cn } from "@/lib/cn";
import { useIpc } from "@/lib/ipc/context";
import { useIsDark } from "@/lib/use-theme";

export interface MarkdownEditorProps {
  /** The item being edited — scopes asset resolution/uploads. */
  itemId: string;
  /** Initial markdown for the WHOLE file (frontmatter + body). */
  value: string;
  onChange?: (markdown: string) => void;
  readOnly?: boolean;
  className?: string;
}

/**
 * MDXEditor wrapper editing a requirement's full markdown file. The frontmatter
 * plugin renders the YAML block as an editable properties panel and the source
 * toggle exposes the entire raw file. Local images/videos are stored as
 * repo-relative paths; `imagePreviewHandler` resolves them to an asset URL for
 * display, and pasted/dropped images are written into the repo working tree via
 * `savePastedAsset`, returning the relative path to embed.
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
          // Full-file editing: frontmatter renders as an editable properties
          // panel; the source toggle shows the entire raw file incl. `---`.
          frontmatterPlugin(),
          markdownShortcutPlugin(),
          toolbarPlugin({
            // Slim toolbar: the essentials + the source/markdown toggle. Tables,
            // rules, underline, etc. remain available via markdown shortcuts.
            toolbarContents: () => (
              <DiffSourceToggleWrapper>
                <UndoRedo />
                <BoldItalicUnderlineToggles />
                <BlockTypeSelect />
                <ListsToggle />
                <CreateLink />
                <InsertImage />
                <InsertCodeBlock />
                <InsertFrontmatter />
              </DiffSourceToggleWrapper>
            ),
          }),
        ]}
      />
    </div>
  );
}
