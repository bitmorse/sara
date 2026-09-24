//! Shared application state held behind a mutex in Tauri's managed state.

use std::path::PathBuf;
use std::sync::Mutex;

use sara_core::graph::KnowledgeGraph;

/// The currently opened project (one git repo = one sara) and its parsed graph.
///
/// `graph` is rebuilt from `repo_paths` on demand (after edits, commits, or a
/// file-watch event) via the `reload_graph` command.
#[derive(Default)]
pub struct Workspace {
    /// Repository roots passed to `service::load_graph`.
    pub repo_paths: Vec<PathBuf>,
    /// The most recently built knowledge graph, if any.
    pub graph: Option<KnowledgeGraph>,
}

/// Tauri-managed handle: `State<AppState>` in every command that needs it.
#[derive(Default)]
pub struct AppState {
    /// Guards the mutable workspace. Commands lock briefly, never across await.
    pub workspace: Mutex<Workspace>,
}
