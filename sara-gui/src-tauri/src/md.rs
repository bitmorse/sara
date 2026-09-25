//! Minimal frontmatter splitter for the read view.
//!
//! sara-core owns frontmatter and only re-exports `has_frontmatter` /
//! `update_frontmatter`, not the extractors — so the GUI splits locally to feed
//! the read renderer just the body. Frontmatter is the YAML between a leading
//! `---` line and the next `---`/`...` line; everything after is the body.
//! (Editing operates on the whole file, so no recombine is needed here.)

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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn splits_frontmatter_from_body() {
        let original = "---\nid: \"X-1\"\ntype: solution\n---\n\n# Title\n\nBody text.\n";
        let (fm, body, had) = split(original);
        assert!(had);
        assert_eq!(fm, "id: \"X-1\"\ntype: solution");
        assert_eq!(body, "# Title\n\nBody text.\n");
    }

    #[test]
    fn no_frontmatter_passes_through() {
        let (fm, body, had) = split("# Just a body\n");
        assert!(!had);
        assert!(fm.is_empty());
        assert_eq!(body, "# Just a body\n");
    }
}
