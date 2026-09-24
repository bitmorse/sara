//! Error type crossing the Tauri IPC boundary.
//!
//! Every `#[tauri::command]` returns `Result<T, GuiError>`; `GuiError`
//! serializes to a `{ code, message }` object the frontend can branch on.

use serde::Serialize;

/// A GUI-facing error with a machine-readable `code` and a human `message`.
#[derive(Debug, Serialize)]
pub struct GuiError {
    /// Stable, kebab-case category (e.g. `graph-load`, `git`, `not-found`).
    pub code: String,
    /// Human-readable detail, safe to surface in a toast.
    pub message: String,
}

impl GuiError {
    /// Builds a `GuiError` from a code and any displayable error.
    pub fn new(code: &str, message: impl std::fmt::Display) -> Self {
        Self {
            code: code.to_string(),
            message: message.to_string(),
        }
    }
}

impl std::fmt::Display for GuiError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "[{}] {}", self.code, self.message)
    }
}

impl std::error::Error for GuiError {}

// Concrete `From` conversions (a blanket `From<E: Display>` would collide with
// the reflexive `From<T> for T`, so we enumerate the error types we bubble up).
impl From<sara_core::error::SaraError> for GuiError {
    fn from(err: sara_core::error::SaraError) -> Self {
        GuiError::new("sara-core", err)
    }
}

impl From<git2::Error> for GuiError {
    fn from(err: git2::Error) -> Self {
        GuiError::new("git", err)
    }
}

impl From<std::io::Error> for GuiError {
    fn from(err: std::io::Error) -> Self {
        GuiError::new("io", err)
    }
}

impl From<serde_json::Error> for GuiError {
    fn from(err: serde_json::Error) -> Self {
        GuiError::new("serialize", err)
    }
}

/// Convenience alias for command results.
pub type GuiResult<T> = Result<T, GuiError>;
