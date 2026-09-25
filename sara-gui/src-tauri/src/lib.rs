//! Tauri v2 backend for the SARA desktop GUI.
//!
//! Reuses `sara-core` for every read path and frontmatter write; a git write
//! layer (status/diff/stage/commit + `log --follow` history) lives in `git.rs`.
//! The active schema is a process-global singleton installed once at startup.

mod commands;
mod dto;
mod error;
mod git;
mod md;
mod recents;
mod state;

use sara_core::schema::{self, Schema};

use state::AppState;

/// Installs the active domain schema exactly once, before any graph operation.
///
/// `install` returns `Err` if another caller already installed — harmless, so
/// we discard it. A configured custom schema can be wired in here later.
fn boot_schema() {
    let _ = schema::install(Schema::builtin());
}

/// Builds and runs the Tauri application.
///
/// # Panics
/// Panics if the Tauri runtime fails to start (unrecoverable at launch).
pub fn run() {
    boot_schema();

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .manage(AppState::default())
        .invoke_handler(tauri::generate_handler![
            commands::get_schema,
            commands::install_schema,
            commands::open_workspace,
            commands::load_graph,
            commands::reload_graph,
            commands::list_items,
            commands::get_item,
            commands::get_item_content,
            commands::get_item_raw,
            commands::save_item_raw,
            commands::save_pasted_asset,
            commands::resolve_asset_path,
            commands::build_tree,
            commands::traverse,
            commands::mermaid,
            commands::validate,
            commands::coverage_report,
            commands::git_current_branch,
            commands::git_status,
            commands::git_file_history,
            commands::git_diff_file,
            commands::git_read_file_at,
            commands::git_stage,
            commands::git_unstage,
            commands::git_commit,
            commands::list_recent_projects,
            commands::remember_project,
            commands::forget_project,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
