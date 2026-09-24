//! Tauri command surface.
//!
//! Read/query/validate/report paths delegate to `sara-core`; frontmatter writes
//! reuse core's Edit/Init services and a body-preserving helper; status / diff /
//! stage / commit / history come from the git2 layer in [`crate::git`].
//!
//! Commands are synchronous so the brief `AppState` lock never crosses an await.

use std::fs;
use std::path::{Path, PathBuf};

use serde::Deserialize;

use sara_core::graph::{KnowledgeGraph, TraversalOptions, traverse_downstream, traverse_upstream};
use sara_core::model::{ItemId, ItemType};
use sara_core::report::CoverageReport;
use sara_core::schema::{self, Schema};
use sara_core::service;
use sara_core::validation;

use crate::dto::*;
use crate::error::{GuiError, GuiResult};
use crate::git::{self, Target};
use crate::md;
use crate::state::AppState;

/// The upstream hierarchy relations that define the outline tree's parent link.
const HIERARCHY_UP: [&str; 3] = ["refines", "derives_from", "satisfies"];

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

type St<'a> = tauri::State<'a, AppState>;

fn lock<'a>(state: &'a St) -> GuiResult<std::sync::MutexGuard<'a, crate::state::Workspace>> {
    state
        .workspace
        .lock()
        .map_err(|_| GuiError::new("state", "workspace lock poisoned"))
}

fn root_of(ws: &crate::state::Workspace) -> GuiResult<PathBuf> {
    ws.repo_paths
        .first()
        .cloned()
        .ok_or_else(|| GuiError::new("state", "no workspace opened"))
}

fn with_graph<T>(
    state: &St,
    f: impl FnOnce(&KnowledgeGraph) -> GuiResult<T>,
) -> GuiResult<T> {
    let ws = lock(state)?;
    let graph = ws
        .graph
        .as_ref()
        .ok_or_else(|| GuiError::new("state", "no graph loaded"))?;
    f(graph)
}

fn find_item<'g>(graph: &'g KnowledgeGraph, id: &str) -> GuiResult<&'g sara_core::model::Item> {
    graph
        .get(&ItemId::new_unchecked(id))
        .ok_or_else(|| GuiError::new("not-found", format!("item {id} not found")))
}

/* -------------------------------------------------------------------------- */
/* Schema & workspace                                                         */
/* -------------------------------------------------------------------------- */

#[tauri::command]
pub fn get_schema() -> GuiResult<SchemaDto> {
    Ok(SchemaDto::from(schema::active()))
}

#[tauri::command]
pub fn open_workspace(root: String, state: St) -> GuiResult<WorkspaceInfoDto> {
    let root_path = PathBuf::from(&root);
    let branch = git::current_branch(&root_path)?;
    let name = root_path
        .file_name()
        .map(|n| n.to_string_lossy().to_string())
        .unwrap_or_else(|| root.clone());

    {
        let mut ws = lock(&state)?;
        if ws.repo_paths.is_empty() {
            ws.repo_paths = vec![root_path.clone()];
        }
    }
    Ok(WorkspaceInfoDto { root, name, branch })
}

#[tauri::command]
pub fn load_graph(paths: Vec<String>, state: St) -> GuiResult<LoadGraphResultDto> {
    let repo_paths: Vec<PathBuf> = paths.into_iter().map(PathBuf::from).collect();
    let (graph, warnings) = service::load_graph(&repo_paths)?;
    let items: Vec<ItemDetailDto> = graph.items().map(ItemDetailDto::from).collect();

    let mut ws = lock(&state)?;
    ws.repo_paths = repo_paths;
    ws.graph = Some(graph);

    Ok(LoadGraphResultDto {
        items,
        warnings: warnings.iter().map(ToString::to_string).collect(),
    })
}

#[tauri::command]
pub fn reload_graph(state: St) -> GuiResult<LoadGraphResultDto> {
    let paths = { lock(&state)?.repo_paths.clone() };
    let paths: Vec<String> = paths.iter().map(|p| p.to_string_lossy().to_string()).collect();
    load_graph(paths, state)
}

/* -------------------------------------------------------------------------- */
/* Items                                                                      */
/* -------------------------------------------------------------------------- */

#[tauri::command]
pub fn list_items(state: St) -> GuiResult<Vec<ItemDetailDto>> {
    with_graph(&state, |g| Ok(g.items().map(ItemDetailDto::from).collect()))
}

#[tauri::command]
pub fn get_item(id: String, state: St) -> GuiResult<ItemDetailDto> {
    with_graph(&state, |g| Ok(ItemDetailDto::from(find_item(g, &id)?)))
}

#[tauri::command]
pub fn get_item_content(id: String, state: St) -> GuiResult<ItemContentDto> {
    let path = with_graph(&state, |g| Ok(find_item(g, &id)?.source.full_path()))?;
    let content = fs::read_to_string(&path)?;
    let (frontmatter, body, _) = md::split(&content);
    Ok(ItemContentDto { frontmatter, body })
}

#[tauri::command]
pub fn save_item_body(id: String, body: String, state: St) -> GuiResult<()> {
    let path = with_graph(&state, |g| Ok(find_item(g, &id)?.source.full_path()))?;
    let content = fs::read_to_string(&path)?;

    // Preserve the frontmatter block; replace only the body.
    let (frontmatter, _, had_fm) = md::split(&content);
    fs::write(&path, md::recombine(&frontmatter, &body, had_fm))?;
    Ok(())
}

#[tauri::command]
pub fn save_pasted_asset(
    item_id: String,
    file_name: String,
    bytes: Vec<u8>,
    state: St,
) -> GuiResult<String> {
    let dir = with_graph(&state, |g| {
        let item = find_item(g, &item_id)?;
        Ok(item
            .source
            .full_path()
            .parent()
            .map(Path::to_path_buf)
            .unwrap_or_else(|| item.source.repository.clone()))
    })?;
    let assets = dir.join("assets");
    fs::create_dir_all(&assets)?;
    // Guard against path traversal via a crafted file name.
    let safe = Path::new(&file_name)
        .file_name()
        .ok_or_else(|| GuiError::new("asset", "invalid file name"))?;
    fs::write(assets.join(safe), &bytes)?;
    Ok(format!("assets/{}", safe.to_string_lossy()))
}

#[tauri::command]
pub fn resolve_asset_path(item_id: String, rel_path: String, state: St) -> GuiResult<String> {
    // Reject absolute paths and `..` traversal — a malicious markdown link must
    // not resolve outside the item's directory.
    let rel = Path::new(&rel_path);
    if rel.is_absolute()
        || rel.components().any(|c| matches!(c, std::path::Component::ParentDir))
    {
        return Err(GuiError::new("asset", "asset path must stay within the item directory"));
    }
    let dir = with_graph(&state, |g| {
        let item = find_item(g, &item_id)?;
        Ok(item
            .source
            .full_path()
            .parent()
            .map(Path::to_path_buf)
            .unwrap_or_else(|| item.source.repository.clone()))
    })?;
    Ok(dir.join(rel).to_string_lossy().to_string())
}

/* -------------------------------------------------------------------------- */
/* Tree & traversal                                                           */
/* -------------------------------------------------------------------------- */

fn hierarchy_parent(item: &sara_core::model::Item) -> Option<String> {
    item.relationships
        .iter()
        .find(|r| r.relationship_type.is_upstream() && HIERARCHY_UP.contains(&r.relationship_type.as_str()))
        .map(|r| r.to.as_str().to_string())
}

#[tauri::command]
pub fn build_tree(state: St) -> GuiResult<Vec<TreeNodeDto>> {
    with_graph(&state, |graph| {
        let order: Vec<String> = ItemType::all().iter().map(|t| t.as_str().to_string()).collect();
        let rank = |t: &str| order.iter().position(|o| o == t).unwrap_or(order.len());

        // Bucket item ids by their hierarchy parent (None = root).
        let mut by_parent: std::collections::HashMap<Option<String>, Vec<&sara_core::model::Item>> =
            std::collections::HashMap::new();
        for item in graph.items() {
            by_parent.entry(hierarchy_parent(item)).or_default().push(item);
        }

        fn build(
            parent: Option<&str>,
            prefix: &str,
            by_parent: &std::collections::HashMap<Option<String>, Vec<&sara_core::model::Item>>,
            rank: &impl Fn(&str) -> usize,
        ) -> Vec<TreeNodeDto> {
            let key = parent.map(str::to_string);
            let mut children = by_parent.get(&key).cloned().unwrap_or_default();
            children.sort_by(|a, b| {
                rank(a.item_type.as_str())
                    .cmp(&rank(b.item_type.as_str()))
                    .then_with(|| a.id.as_str().cmp(b.id.as_str()))
            });
            children
                .into_iter()
                .enumerate()
                .map(|(i, item)| {
                    let outline = if prefix.is_empty() {
                        format!("{}", i + 1)
                    } else {
                        format!("{prefix}.{}", i + 1)
                    };
                    TreeNodeDto {
                        item: ItemSummaryDto {
                            id: item.id.as_str().to_string(),
                            item_type: item.item_type.as_str().to_string(),
                            name: item.name.clone(),
                            file_path: item.source.file_path.to_string_lossy().to_string(),
                        },
                        children: build(Some(item.id.as_str()), &outline, by_parent, rank),
                        outline,
                    }
                })
                .collect()
        }

        Ok(build(None, "", &by_parent, &rank))
    })
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TraverseOpts {
    direction: String,
    max_depth: Option<usize>,
    #[serde(default)]
    types: Vec<String>,
}

fn run_traversal(graph: &KnowledgeGraph, id: &str, opts: &TraverseOpts) -> GuiResult<TraversalResultDto> {
    let item_id = ItemId::new_unchecked(id);
    let mut options = TraversalOptions::new();
    if let Some(d) = opts.max_depth {
        options = options.with_max_depth(d);
    }
    if !opts.types.is_empty() {
        let types: Vec<ItemType> = opts.types.iter().filter_map(|t| ItemType::from_id(t)).collect();
        options = options.with_types(types);
    }

    let result = match opts.direction.as_str() {
        "downstream" => traverse_downstream(graph, &item_id, &options),
        _ => traverse_upstream(graph, &item_id, &options),
    }
    .ok_or_else(|| GuiError::new("not-found", format!("item {id} not found")))?;

    let nodes = result
        .items
        .iter()
        .map(|n| {
            let item = graph.get(&n.item_id);
            TraversalNodeDto {
                id: n.item_id.as_str().to_string(),
                name: item.map(|i| i.name.clone()).unwrap_or_default(),
                item_type: item.map(|i| i.item_type.as_str().to_string()).unwrap_or_default(),
                depth: n.depth,
                parent_id: n.parent.as_ref().map(|p| p.as_str().to_string()),
                relation: n.relationship.as_ref().map(|r| r.as_str().to_string()),
            }
        })
        .collect();

    Ok(TraversalResultDto {
        origin_id: result.origin.as_str().to_string(),
        direction: opts.direction.clone(),
        nodes,
        max_depth: result.max_depth,
    })
}

#[tauri::command]
pub fn traverse(id: String, opts: TraverseOpts, state: St) -> GuiResult<TraversalResultDto> {
    with_graph(&state, |g| run_traversal(g, &id, &opts))
}

#[tauri::command]
pub fn mermaid(id: String, opts: TraverseOpts, state: St) -> GuiResult<String> {
    let result = with_graph(&state, |g| run_traversal(g, &id, &opts))?;
    let mut lines = vec!["flowchart BT".to_string()];
    for n in &result.nodes {
        lines.push(format!("    {}[\"{}<br>{}\"]", n.id, n.id, n.name));
    }
    for n in &result.nodes {
        if let (Some(parent), Some(rel)) = (&n.parent_id, &n.relation) {
            lines.push(format!("    {} -->|{}| {}", n.id, rel, parent));
        }
    }
    lines.push(format!("    class {} origin", result.origin_id));
    let mut by_type: std::collections::BTreeMap<String, Vec<String>> = std::collections::BTreeMap::new();
    for n in &result.nodes {
        by_type.entry(n.item_type.clone()).or_default().push(n.id.clone());
    }
    for (ty, ids) in by_type {
        lines.push(format!("    class {} {}", ids.join(","), ty));
    }
    Ok(lines.join("\n"))
}

/* -------------------------------------------------------------------------- */
/* Validation & reports                                                       */
/* -------------------------------------------------------------------------- */

#[tauri::command]
pub fn validate(strict: bool, state: St) -> GuiResult<ValidationReportDto> {
    with_graph(&state, |g| Ok(ValidationReportDto::from(&validation::validate(g, strict))))
}

#[tauri::command]
pub fn coverage_report(state: St) -> GuiResult<CoverageReportDto> {
    with_graph(&state, |g| Ok(CoverageReportDto::from(&CoverageReport::generate(g))))
}

/* -------------------------------------------------------------------------- */
/* Git                                                                        */
/* -------------------------------------------------------------------------- */

#[derive(Deserialize)]
#[serde(tag = "kind", rename_all = "lowercase")]
pub enum GitTargetArg {
    Working,
    Index,
    Ref {
        #[serde(rename = "ref")]
        reference: String,
    },
}

impl From<GitTargetArg> for Target {
    fn from(a: GitTargetArg) -> Self {
        match a {
            GitTargetArg::Working => Target::Working,
            GitTargetArg::Index => Target::Index,
            GitTargetArg::Ref { reference } => Target::Ref(reference),
        }
    }
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CommitReq {
    message: String,
    #[serde(default)]
    amend: bool,
}

#[tauri::command]
pub fn git_current_branch(state: St) -> GuiResult<BranchInfoDto> {
    let ws = lock(&state)?;
    let root = root_of(&ws)?;
    git::current_branch(&root)
}

#[tauri::command]
pub fn git_status(state: St) -> GuiResult<Vec<FileStatusDto>> {
    let ws = lock(&state)?;
    let root = root_of(&ws)?;
    git::status(&root)
}

#[tauri::command]
pub fn git_file_history(path: String, state: St) -> GuiResult<Vec<CommitInfoDto>> {
    let ws = lock(&state)?;
    let root = root_of(&ws)?;
    git::file_history(&root, &path)
}

#[tauri::command]
pub fn git_diff_file(
    path: String,
    from: GitTargetArg,
    to: GitTargetArg,
    state: St,
) -> GuiResult<FileDiffDto> {
    let ws = lock(&state)?;
    let root = root_of(&ws)?;
    git::diff_file(&root, &path, from.into(), to.into())
}

#[tauri::command]
pub fn git_read_file_at(sha: String, path: String, state: St) -> GuiResult<String> {
    let ws = lock(&state)?;
    let root = root_of(&ws)?;
    git::read_file_at(&root, &sha, &path)
}

#[tauri::command]
pub fn git_stage(paths: Vec<String>, state: St) -> GuiResult<()> {
    let ws = lock(&state)?;
    let root = root_of(&ws)?;
    git::stage(&root, &paths)
}

#[tauri::command]
pub fn git_unstage(paths: Vec<String>, state: St) -> GuiResult<()> {
    let ws = lock(&state)?;
    let root = root_of(&ws)?;
    git::unstage(&root, &paths)
}

#[tauri::command]
pub fn git_commit(req: CommitReq, state: St) -> GuiResult<CommitInfoDto> {
    let ws = lock(&state)?;
    let root = root_of(&ws)?;
    git::commit(&root, &req.message, req.amend)
}

/// Re-installs the built-in schema (idempotent) — exposed for completeness.
#[tauri::command]
pub fn install_schema() -> GuiResult<SchemaDto> {
    let _ = schema::install(Schema::builtin());
    Ok(SchemaDto::from(schema::active()))
}
