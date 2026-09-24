//! Minimal frontmatter splitter for the body-only editor round-trip.
//!
//! sara-core owns frontmatter and only re-exports `has_frontmatter` /
//! `update_frontmatter`, not the extractors — so the GUI splits/recombines
//! locally. Frontmatter is the YAML between a leading `---` line and the next
//! `---`/`...` line; everything after is the body.

/// Splits content into `(frontmatter_inner, body, had_frontmatter)`.
pub fn split(content: &str) -> (String, String, bool) {
    let mut lines = content.split_inclusive('\n');

    match lines.next() {
        Some(first) if first.trim_end() == "---" => {
            let mut fm = String::new();
            let mut consumed = first.len();
            for line in lines {
                consumed += line.len();
                let trimmed = line.trim_end();
                if trimmed == "---" || trimmed == "..." {
                    let body = content[consumed..].trim_start_matches('\n');
                    return (fm.trim_end_matches('\n').to_string(), body.to_string(), true);
                }
                fm.push_str(line);
            }
            // Unterminated fence — treat the whole file as body.
            (String::new(), content.to_string(), false)
        }
        _ => (String::new(), content.to_string(), false),
    }
}

/// Recombines a (possibly empty) frontmatter block with a new body, keeping the
/// frontmatter YAML intact so only the body region changes in git diffs.
pub fn recombine(frontmatter: &str, body: &str, had_frontmatter: bool) -> String {
    let body = body.trim_end_matches('\n');
    if had_frontmatter {
        format!("---\n{}\n---\n\n{}\n", frontmatter.trim_matches('\n'), body)
    } else {
        format!("{body}\n")
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn round_trip_is_idempotent() {
        let original = "---\nid: \"X-1\"\ntype: solution\n---\n\n# Title\n\nBody text.\n";
        let (fm, body, had) = split(original);
        assert!(had);
        assert_eq!(fm, "id: \"X-1\"\ntype: solution");
        let rebuilt = recombine(&fm, &body, had);
        // Splitting the rebuilt output yields the same parts (no drift).
        let (fm2, body2, had2) = split(&rebuilt);
        assert_eq!((fm, body), (fm2, body2));
        assert!(had2);
    }

    #[test]
    fn no_frontmatter_passes_through() {
        let (fm, body, had) = split("# Just a body\n");
        assert!(!had);
        assert!(fm.is_empty());
        assert_eq!(body, "# Just a body\n");
    }
}
