//! GUI-facing DTOs and conversions from `sara-core` domain types.
//!
//! These serialize (camelCase) to exactly the shapes `src/types/domain.ts`
//! declares, decoupling the frontend from sara-core's raw serde. (A follow-up
//! can derive these with `ts-rs` to generate the `.ts` automatically.)

use serde::Serialize;
use serde_json::Value;

use sara_core::model::{FieldValue, Item, RelationshipType};
use sara_core::report::CoverageReport;
use sara_core::schema::{FieldType, RelationDirection, Schema};
use sara_core::validation::{Severity, ValidationReport};

/* -------------------------------------------------------------------------- */
/* Schema                                                                     */
/* -------------------------------------------------------------------------- */

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FieldDefDto {
    pub name: String,
    pub display_name: String,
    pub field_type: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub inner: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub enum_values: Option<Vec<String>>,
    pub required: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub placeholder: Option<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AllowedTargetDto {
    pub relation: String,
    pub targets: Vec<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ItemTypeDefDto {
    pub id: String,
    pub display_name: String,
    pub prefix: String,
    pub id_format: String,
    pub parent_types: Vec<String>,
    pub fields: Vec<FieldDefDto>,
    pub allowed_targets: Vec<AllowedTargetDto>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RelationDefDto {
    pub id: String,
    pub display_name: String,
    pub inverse: String,
    pub direction: String,
    pub primary: bool,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SchemaDto {
    pub item_types: Vec<ItemTypeDefDto>,
    pub relations: Vec<RelationDefDto>,
}

fn field_type_parts(ft: &FieldType) -> (String, Option<String>, Option<Vec<String>>) {
    match ft {
        FieldType::Text => ("text".into(), None, None),
        FieldType::Enum { values } => ("enum".into(), None, Some(values.clone())),
        FieldType::ItemRef => ("item_ref".into(), None, None),
        FieldType::Date => ("date".into(), None, None),
        FieldType::List(inner) => {
            let (kind, _, _) = field_type_parts(inner);
            ("list".into(), Some(kind), None)
        }
    }
}

fn direction_str(d: &RelationDirection) -> String {
    match d {
        RelationDirection::Upstream => "upstream",
        RelationDirection::Downstream => "downstream",
        RelationDirection::Peer => "peer",
    }
    .into()
}

impl From<&Schema> for SchemaDto {
    fn from(s: &Schema) -> Self {
        SchemaDto {
            item_types: s
                .item_types
                .iter()
                .map(|t| ItemTypeDefDto {
                    id: t.id.clone(),
                    display_name: t.display_name.clone(),
                    prefix: t.prefix.clone(),
                    id_format: t.id_format.clone(),
                    parent_types: t.parent_types.clone(),
                    fields: t
                        .fields
                        .iter()
                        .map(|f| {
                            let (field_type, inner, enum_values) = field_type_parts(&f.field_type);
                            FieldDefDto {
                                name: f.name.clone(),
                                display_name: f.display_name.clone(),
                                field_type,
                                inner,
                                enum_values,
                                required: f.required,
                                placeholder: f.placeholder.clone(),
                            }
                        })
                        .collect(),
                    allowed_targets: t
                        .allowed_targets
                        .iter()
                        .map(|a| AllowedTargetDto {
                            relation: a.relation.clone(),
                            targets: a.targets.clone(),
                        })
                        .collect(),
                })
                .collect(),
            relations: s
                .relations
                .iter()
                .map(|r| RelationDefDto {
                    id: r.id.clone(),
                    display_name: r.display_name.clone(),
                    inverse: r.inverse.clone(),
                    direction: direction_str(&r.direction),
                    primary: r.primary,
                })
                .collect(),
        }
    }
}

/* -------------------------------------------------------------------------- */
/* Items                                                                      */
/* -------------------------------------------------------------------------- */

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AttributeValueDto {
    pub name: String,
    pub display_name: String,
    pub field_type: String,
    pub value: Value,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RelationshipDto {
    pub relation: String,
    pub target_id: String,
    pub direction: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ItemDetailDto {
    pub id: String,
    #[serde(rename = "type")]
    pub item_type: String,
    pub name: String,
    pub file_path: String,
    pub repository: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    pub attributes: Vec<AttributeValueDto>,
    pub relationships: Vec<RelationshipDto>,
}

fn field_value_kind(v: &FieldValue) -> &'static str {
    match v {
        FieldValue::Text(_) => "text",
        FieldValue::Enum(_) => "enum",
        FieldValue::ItemRef(_) => "item_ref",
        FieldValue::List(_) => "list",
        FieldValue::Date(_) => "date",
    }
}

fn field_value_json(v: &FieldValue) -> Value {
    match v {
        FieldValue::Text(s) | FieldValue::Enum(s) | FieldValue::Date(s) => Value::String(s.clone()),
        FieldValue::ItemRef(id) => Value::String(id.as_str().to_string()),
        FieldValue::List(items) => Value::Array(
            items
                .iter()
                .map(|i| match i {
                    FieldValue::Text(s) | FieldValue::Enum(s) | FieldValue::Date(s) => {
                        Value::String(s.clone())
                    }
                    FieldValue::ItemRef(id) => Value::String(id.as_str().to_string()),
                    other => field_value_json(other),
                })
                .collect(),
        ),
    }
}

fn rel_direction(rt: &RelationshipType) -> &'static str {
    if rt.is_upstream() {
        "upstream"
    } else if rt.is_downstream() {
        "downstream"
    } else {
        "peer"
    }
}

impl From<&Item> for ItemDetailDto {
    fn from(item: &Item) -> Self {
        ItemDetailDto {
            id: item.id.as_str().to_string(),
            item_type: item.item_type.as_str().to_string(),
            name: item.name.clone(),
            file_path: item.source.file_path.to_string_lossy().to_string(),
            repository: item.source.repository.to_string_lossy().to_string(),
            description: item.description.clone(),
            attributes: item
                .attributes
                .iter()
                .map(|(name, value)| AttributeValueDto {
                    name: name.clone(),
                    display_name: item
                        .item_type
                        .declared_field(name)
                        .map(|f| f.display_name.to_string())
                        .unwrap_or_else(|| name.clone()),
                    field_type: field_value_kind(value).to_string(),
                    value: field_value_json(value),
                })
                .collect(),
            relationships: item
                .relationships
                .iter()
                .map(|r| RelationshipDto {
                    relation: r.relationship_type.as_str().to_string(),
                    target_id: r.to.as_str().to_string(),
                    direction: rel_direction(&r.relationship_type).to_string(),
                })
                .collect(),
        }
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ItemContentDto {
    pub frontmatter: String,
    pub body: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ItemSummaryDto {
    pub id: String,
    #[serde(rename = "type")]
    pub item_type: String,
    pub name: String,
    pub file_path: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TreeNodeDto {
    pub item: ItemSummaryDto,
    pub outline: String,
    pub children: Vec<TreeNodeDto>,
}

/* -------------------------------------------------------------------------- */
/* Traversal                                                                  */
/* -------------------------------------------------------------------------- */

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TraversalNodeDto {
    pub id: String,
    pub name: String,
    #[serde(rename = "type")]
    pub item_type: String,
    pub depth: usize,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub parent_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub relation: Option<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TraversalResultDto {
    pub origin_id: String,
    pub direction: String,
    pub nodes: Vec<TraversalNodeDto>,
    pub max_depth: usize,
}

/* -------------------------------------------------------------------------- */
/* Validation & reports                                                       */
/* -------------------------------------------------------------------------- */

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ValidationIssueDto {
    pub severity: String,
    pub rule: String,
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub item_id: Option<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ValidationReportDto {
    pub valid: bool,
    pub items_checked: usize,
    pub relationships_checked: usize,
    pub items_by_type: std::collections::HashMap<String, usize>,
    pub issues: Vec<ValidationIssueDto>,
}

/// Derives a kebab-case rule slug and an optional item id from a `SaraError`.
fn classify_issue(err: &sara_core::error::SaraError) -> (String, Option<String>) {
    use sara_core::error::SaraError as E;
    match err {
        E::BrokenReference { from, .. } => ("broken-reference".into(), Some(from.to_string())),
        E::OrphanItem { id, .. } => ("orphan-item".into(), Some(id.to_string())),
        E::DuplicateIdentifier { id, .. } => ("duplicate-identifier".into(), Some(id.to_string())),
        E::CircularReference { .. } => ("circular-reference".into(), None),
        E::InvalidRelationship { from_id, .. } => {
            ("invalid-relationship".into(), Some(from_id.to_string()))
        }
        E::InvalidId { id, .. } => ("invalid-id".into(), Some(id.to_string())),
        E::RedundantRelationship { .. } => ("redundant-relationship".into(), None),
        _ => ("validation".into(), None),
    }
}

impl From<&ValidationReport> for ValidationReportDto {
    fn from(r: &ValidationReport) -> Self {
        ValidationReportDto {
            valid: r.is_valid(),
            items_checked: r.items_checked,
            relationships_checked: r.relationships_checked,
            items_by_type: r
                .items_by_type
                .iter()
                .map(|(t, n)| (t.as_str().to_string(), *n))
                .collect(),
            issues: r
                .issues
                .iter()
                .map(|issue| {
                    let (rule, item_id) = classify_issue(&issue.error);
                    ValidationIssueDto {
                        severity: match issue.severity {
                            Severity::Error => "error".into(),
                            Severity::Warning => "warning".into(),
                        },
                        rule,
                        message: issue.error.to_string(),
                        item_id,
                    }
                })
                .collect(),
        }
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TypeCoverageDto {
    #[serde(rename = "type")]
    pub item_type: String,
    pub total: usize,
    pub complete: usize,
    pub coverage_percent: f64,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CoverageReportDto {
    pub overall_coverage: f64,
    pub total_items: usize,
    pub complete_items: usize,
    pub by_type: Vec<TypeCoverageDto>,
}

impl From<&CoverageReport> for CoverageReportDto {
    fn from(r: &CoverageReport) -> Self {
        CoverageReportDto {
            overall_coverage: r.overall_coverage,
            total_items: r.total_items,
            complete_items: r.complete_items,
            by_type: r
                .by_type
                .iter()
                .map(|t| TypeCoverageDto {
                    item_type: t.item_type.as_str().to_string(),
                    total: t.total,
                    complete: t.complete,
                    coverage_percent: t.coverage_percent,
                })
                .collect(),
        }
    }
}

/* -------------------------------------------------------------------------- */
/* Workspace & git                                                            */
/* -------------------------------------------------------------------------- */

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BranchInfoDto {
    pub name: String,
    pub ahead: usize,
    pub behind: usize,
    pub detached: bool,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct WorkspaceInfoDto {
    pub root: String,
    pub name: String,
    pub branch: BranchInfoDto,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LoadGraphResultDto {
    pub items: Vec<ItemDetailDto>,
    pub warnings: Vec<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FileStatusDto {
    pub path: String,
    pub staged: bool,
    pub kind: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CommitInfoDto {
    pub sha: String,
    pub short_sha: String,
    pub author: String,
    pub email: String,
    pub date: String,
    pub summary: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DiffLineDto {
    pub kind: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub old_no: Option<usize>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub new_no: Option<usize>,
    pub text: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FileDiffDto {
    pub path: String,
    pub binary: bool,
    pub lines: Vec<DiffLineDto>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RecentProjectDto {
    pub root: String,
    pub name: String,
    pub last_opened_at: String,
    /// True when the path no longer exists on disk (stale entry).
    pub missing: bool,
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::PathBuf;

    fn example_repo() -> PathBuf {
        PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../examples/smart-home")
    }

    /// Loads the real example project and checks the item DTO serializes to the
    /// exact shape (camelCase, `type` id, string attributes) the frontend expects.
    #[test]
    fn item_dto_matches_frontend_contract() {
        let _ = sara_core::schema::install(sara_core::schema::Schema::builtin());
        let (graph, _) = sara_core::service::load_graph(&[example_repo()]).unwrap();

        let sysreq = graph
            .get(&sara_core::model::ItemId::new_unchecked("SYSREQ-002"))
            .expect("SYSREQ-002 should exist in the example project");
        let dto = ItemDetailDto::from(sysreq);
        let json = serde_json::to_value(&dto).unwrap();

        assert_eq!(json["id"], "SYSREQ-002");
        assert_eq!(json["type"], "system_requirement");
        assert_eq!(json["name"], "Security Alert Delivery");
        // specification is a Text attribute → string value
        let spec = json["attributes"]
            .as_array()
            .unwrap()
            .iter()
            .find(|a| a["name"] == "specification")
            .expect("specification attribute");
        assert_eq!(spec["fieldType"], "text");
        assert!(spec["value"].as_str().unwrap().contains("SHALL"));
        // relationships carry a resolved direction
        assert!(json["relationships"].as_array().unwrap().iter().any(|r| {
            r["relation"] == "derives_from" && r["direction"] == "upstream"
        }));
    }

    /// The schema DTO exposes camelCase fields and the built-in type set.
    #[test]
    fn schema_dto_shape() {
        let _ = sara_core::schema::install(sara_core::schema::Schema::builtin());
        let dto = SchemaDto::from(sara_core::schema::active());
        let json = serde_json::to_value(&dto).unwrap();
        let types = json["itemTypes"].as_array().unwrap();
        assert!(types.iter().any(|t| t["id"] == "architecture_decision_record"));
        let adr = types.iter().find(|t| t["id"] == "architecture_decision_record").unwrap();
        let status = adr["fields"]
            .as_array()
            .unwrap()
            .iter()
            .find(|f| f["name"] == "status")
            .unwrap();
        assert_eq!(status["fieldType"], "enum");
        assert!(status["enumValues"].as_array().unwrap().contains(&Value::from("accepted")));
    }
}
