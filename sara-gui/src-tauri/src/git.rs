//! Git write/history layer for the GUI (git2 + a `git log --follow` shell-out).
//!
//! sara-core's gix is read-only; this module adds working-tree status, textual
//! diff, staging, commit, and per-file history. It is deliberately isolated so
//! the core stays read-only.

use std::path::Path;
use std::process::Command;

use chrono::DateTime;
use git2::{Diff, DiffFormat, DiffOptions, Repository, Status, StatusOptions};

use crate::dto::{BranchInfoDto, CommitInfoDto, DiffLineDto, FileDiffDto, FileStatusDto};
use crate::error::{GuiError, GuiResult};

/// One side of a diff, mirroring the frontend `GitTarget`.
pub enum Target {
    Working,
    Index,
    Ref(String),
}

fn open(root: &Path) -> GuiResult<Repository> {
    Repository::discover(root).map_err(GuiError::from)
}

/// Current branch, with ahead/behind against its upstream when available.
pub fn current_branch(root: &Path) -> GuiResult<BranchInfoDto> {
    let repo = open(root)?;
    let detached = repo.head_detached().unwrap_or(false);
    let head = repo.head().ok();
    let name = head
        .as_ref()
        .and_then(|h| h.shorthand())
        .unwrap_or("HEAD")
        .to_string();

    let (mut ahead, mut behind) = (0usize, 0usize);
    if let Some(local) = head.as_ref().and_then(|h| h.target())
        && let Ok(branch) = repo.find_branch(&name, git2::BranchType::Local)
        && let Ok(upstream) = branch.upstream()
        && let Some(up_oid) = upstream.get().target()
        && let Ok((a, b)) = repo.graph_ahead_behind(local, up_oid)
    {
        ahead = a;
        behind = b;
    }

    Ok(BranchInfoDto { name, ahead, behind, detached })
}

fn kind_for(status: Status, staged: bool) -> Option<&'static str> {
    if status.contains(Status::CONFLICTED) {
        return Some("conflicted");
    }
    if staged {
        if status.contains(Status::INDEX_NEW) {
            Some("added")
        } else if status.contains(Status::INDEX_DELETED) {
            Some("deleted")
        } else if status.contains(Status::INDEX_RENAMED) {
            Some("renamed")
        } else if status.intersects(Status::INDEX_MODIFIED | Status::INDEX_TYPECHANGE) {
            Some("modified")
        } else {
            None
        }
    } else if status.contains(Status::WT_NEW) {
        Some("untracked")
    } else if status.contains(Status::WT_DELETED) {
        Some("deleted")
    } else if status.contains(Status::WT_RENAMED) {
        Some("renamed")
    } else if status.intersects(Status::WT_MODIFIED | Status::WT_TYPECHANGE) {
        Some("modified")
    } else {
        None
    }
}

/// Working-tree status split into staged/unstaged entries (à la porcelain).
pub fn status(root: &Path) -> GuiResult<Vec<FileStatusDto>> {
    let repo = open(root)?;
    let mut opts = StatusOptions::new();
    opts.include_untracked(true).recurse_untracked_dirs(true).renames_head_to_index(true);
    let statuses = repo.statuses(Some(&mut opts))?;

    let mut out = Vec::new();
    for entry in statuses.iter() {
        let s = entry.status();
        let path = entry.path().unwrap_or_default().to_string();
        if let Some(kind) = kind_for(s, true) {
            out.push(FileStatusDto { path: path.clone(), staged: true, kind: kind.into() });
        }
        if let Some(kind) = kind_for(s, false) {
            out.push(FileStatusDto { path, staged: false, kind: kind.into() });
        }
    }
    Ok(out)
}

fn diff_to_lines(diff: &Diff, path: &str) -> GuiResult<FileDiffDto> {
    let mut lines: Vec<DiffLineDto> = Vec::new();
    let mut binary = false;

    diff.print(DiffFormat::Patch, |_delta, _hunk, line| {
        let text = String::from_utf8_lossy(line.content()).trim_end_matches('\n').to_string();
        let kind = match line.origin() {
            '+' => "add",
            '-' => "remove",
            ' ' => "context",
            'H' => "hunk",
            'F' => "meta",
            'B' => {
                binary = true;
                "meta"
            }
            _ => "meta",
        };
        // Skip the file-header noise ('F'/'meta' block) — the UI shows the path.
        if kind == "meta" && line.origin() == 'F' {
            return true;
        }
        lines.push(DiffLineDto {
            kind: kind.into(),
            old_no: line.old_lineno().map(|n| n as usize),
            new_no: line.new_lineno().map(|n| n as usize),
            text,
        });
        true
    })?;

    Ok(FileDiffDto { path: path.to_string(), binary, lines })
}

fn tree_for<'r>(repo: &'r Repository, spec: &str) -> GuiResult<git2::Tree<'r>> {
    let obj = repo.revparse_single(spec)?;
    let commit = obj.peel_to_commit()?;
    commit.tree().map_err(GuiError::from)
}

/// Textual diff of one file between two targets (working/index/ref).
pub fn diff_file(root: &Path, path: &str, from: Target, to: Target) -> GuiResult<FileDiffDto> {
    let repo = open(root)?;
    let mut opts = DiffOptions::new();
    opts.pathspec(path).context_lines(3);

    // The UI's common cases: working-vs-ref, index-vs-ref, ref-vs-ref.
    let diff = match (from, to) {
        (Target::Working, Target::Ref(r)) => {
            let tree = tree_for(&repo, &r)?;
            repo.diff_tree_to_workdir_with_index(Some(&tree), Some(&mut opts))?
        }
        (Target::Index, Target::Ref(r)) => {
            let tree = tree_for(&repo, &r)?;
            repo.diff_tree_to_index(Some(&tree), None, Some(&mut opts))?
        }
        (Target::Ref(a), Target::Ref(b)) => {
            let ta = tree_for(&repo, &a)?;
            let tb = tree_for(&repo, &b)?;
            repo.diff_tree_to_tree(Some(&ta), Some(&tb), Some(&mut opts))?
        }
        (Target::Working, Target::Index) => {
            repo.diff_index_to_workdir(None, Some(&mut opts))?
        }
        _ => return Err(GuiError::new("git", "unsupported diff target combination")),
    };

    diff_to_lines(&diff, path)
}

/// Stages paths (adds existing files, records deletions).
pub fn stage(root: &Path, paths: &[String]) -> GuiResult<()> {
    let repo = open(root)?;
    let mut index = repo.index()?;
    let workdir = repo.workdir().ok_or_else(|| GuiError::new("git", "bare repository"))?;
    for p in paths {
        let rel = Path::new(p);
        if workdir.join(rel).exists() {
            index.add_path(rel)?;
        } else {
            index.remove_path(rel)?;
        }
    }
    index.write().map_err(GuiError::from)
}

/// Unstages paths by resetting their index entry to HEAD.
pub fn unstage(root: &Path, paths: &[String]) -> GuiResult<()> {
    let repo = open(root)?;
    let head = repo.head().ok().and_then(|h| h.peel_to_commit().ok());
    if let Some(commit) = head {
        let pathspecs: Vec<&str> = paths.iter().map(String::as_str).collect();
        repo.reset_default(Some(commit.as_object()), pathspecs)?;
    }
    Ok(())
}

fn to_commit_info(commit: &git2::Commit<'_>) -> CommitInfoDto {
    let author = commit.author();
    let secs = commit.time().seconds();
    let date = DateTime::from_timestamp(secs, 0)
        .map(|d| d.to_rfc3339())
        .unwrap_or_default();
    let sha = commit.id().to_string();
    CommitInfoDto {
        short_sha: sha.chars().take(7).collect(),
        sha,
        author: author.name().unwrap_or("").to_string(),
        email: author.email().unwrap_or("").to_string(),
        date,
        summary: commit.summary().unwrap_or("").to_string(),
    }
}

/// Commits the staged tree with the repo's configured signature.
pub fn commit(root: &Path, message: &str, amend: bool) -> GuiResult<CommitInfoDto> {
    let repo = open(root)?;
    let sig = repo.signature()?;
    let mut index = repo.index()?;
    let tree = repo.find_tree(index.write_tree()?)?;
    let head = repo.head().ok().and_then(|h| h.peel_to_commit().ok());

    let oid = if amend {
        let target = head.ok_or_else(|| GuiError::new("git", "nothing to amend"))?;
        target.amend(Some("HEAD"), Some(&sig), Some(&sig), None, Some(message), Some(&tree))?
    } else {
        let parents: Vec<&git2::Commit> = head.iter().collect();
        repo.commit(Some("HEAD"), &sig, &sig, message, &tree, &parents)?
    };

    let commit = repo.find_commit(oid)?;
    Ok(to_commit_info(&commit))
}

/// Per-file history via `git log --follow` (the one op libgit2 does poorly).
pub fn file_history(root: &Path, path: &str) -> GuiResult<Vec<CommitInfoDto>> {
    let out = Command::new("git")
        .arg("-C")
        .arg(root)
        .args(["log", "--follow", "--format=%H%x1f%an%x1f%ae%x1f%aI%x1f%s", "--"])
        .arg(path)
        .output()
        .map_err(|e| GuiError::new("git", format!("failed to run git: {e}")))?;

    if !out.status.success() {
        return Err(GuiError::new("git", String::from_utf8_lossy(&out.stderr)));
    }

    let commits = String::from_utf8_lossy(&out.stdout)
        .lines()
        .filter_map(|line| {
            let mut f = line.split('\u{1f}');
            let sha = f.next()?.to_string();
            Some(CommitInfoDto {
                short_sha: sha.chars().take(7).collect(),
                sha,
                author: f.next()?.to_string(),
                email: f.next()?.to_string(),
                date: f.next()?.to_string(),
                summary: f.next().unwrap_or("").to_string(),
            })
        })
        .collect();
    Ok(commits)
}

/// Reads a file's contents at a given commit-ish (read-only).
pub fn read_file_at(root: &Path, spec: &str, path: &str) -> GuiResult<String> {
    let repo = open(root)?;
    let obj = repo.revparse_single(&format!("{spec}:{path}"))?;
    let blob = obj.peel_to_blob()?;
    Ok(String::from_utf8_lossy(blob.content()).to_string())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;

    /// Full status → stage → commit → history → diff lifecycle on a temp repo.
    #[test]
    fn git_lifecycle() {
        let dir = tempfile::tempdir().unwrap();
        let root = dir.path();
        let repo = Repository::init(root).unwrap();
        {
            let mut cfg = repo.config().unwrap();
            cfg.set_str("user.name", "Test").unwrap();
            cfg.set_str("user.email", "test@example.com").unwrap();
        }

        fs::write(root.join("a.md"), "# Title\n\nfirst\n").unwrap();

        // Untracked before staging.
        let st = status(root).unwrap();
        assert!(st.iter().any(|f| f.path == "a.md" && !f.staged && f.kind == "untracked"));

        stage(root, &["a.md".into()]).unwrap();
        let st = status(root).unwrap();
        assert!(st.iter().any(|f| f.path == "a.md" && f.staged && f.kind == "added"));

        let commit = commit(root, "feat: add a", false).unwrap();
        assert_eq!(commit.summary, "feat: add a");
        assert_eq!(commit.short_sha.len(), 7);

        let history = file_history(root, "a.md").unwrap();
        assert_eq!(history.len(), 1);
        assert_eq!(history[0].summary, "feat: add a");

        // Modify and diff working tree vs HEAD.
        fs::write(root.join("a.md"), "# Title\n\nsecond\n").unwrap();
        let diff = diff_file(root, "a.md", Target::Working, Target::Ref("HEAD".into())).unwrap();
        assert!(diff.lines.iter().any(|l| l.kind == "add" && l.text.contains("second")));
        assert!(diff.lines.iter().any(|l| l.kind == "remove" && l.text.contains("first")));
    }
}
