//! Recent-projects persistence — a small JSON list in the app config dir.
//!
//! Pure helpers (load/save/touch) kept separate from the Tauri commands so they
//! can be unit-tested against a temp path.

use std::fs;
use std::path::Path;

use serde::{Deserialize, Serialize};

/// One stored recent project (the persisted shape). Display fields (`name`,
/// `missing`) are derived at read time, not stored.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct StoredRecent {
    pub root: String,
    pub last_opened_at: String,
}

/// Maximum number of recent projects retained.
pub const CAP: usize = 10;

/// Loads the list, returning empty on a missing/corrupt file (non-fatal).
pub fn load(path: &Path) -> Vec<StoredRecent> {
    fs::read_to_string(path)
        .ok()
        .and_then(|s| serde_json::from_str(&s).ok())
        .unwrap_or_default()
}

/// Writes the list, creating parent directories as needed.
pub fn save(path: &Path, list: &[StoredRecent]) -> std::io::Result<()> {
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)?;
    }
    fs::write(path, serde_json::to_string_pretty(list).unwrap_or_default())
}

/// Moves `root` to the front with a fresh timestamp (dedup by root, cap at CAP).
pub fn touch(list: Vec<StoredRecent>, root: &str, now: String) -> Vec<StoredRecent> {
    let mut out = Vec::with_capacity(list.len() + 1);
    out.push(StoredRecent { root: root.to_string(), last_opened_at: now });
    out.extend(list.into_iter().filter(|r| r.root != root));
    out.truncate(CAP);
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn touch_dedups_and_moves_to_front() {
        let list = vec![
            StoredRecent { root: "/a".into(), last_opened_at: "t1".into() },
            StoredRecent { root: "/b".into(), last_opened_at: "t2".into() },
        ];
        let out = touch(list, "/b", "t3".into());
        assert_eq!(out.iter().map(|r| r.root.as_str()).collect::<Vec<_>>(), ["/b", "/a"]);
        assert_eq!(out[0].last_opened_at, "t3");
    }

    #[test]
    fn touch_caps_at_ten() {
        let mut list = Vec::new();
        for i in 0..12 {
            list = touch(list, &format!("/p{i}"), format!("t{i}"));
        }
        assert_eq!(list.len(), CAP);
        assert_eq!(list[0].root, "/p11");
    }

    #[test]
    fn load_save_round_trip() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("nested").join("recents.json");
        let list = touch(Vec::new(), "/repo", "t0".into());
        save(&path, &list).unwrap();
        assert_eq!(load(&path), list);
    }

    #[test]
    fn load_missing_is_empty() {
        assert!(load(Path::new("/no/such/recents.json")).is_empty());
    }
}
