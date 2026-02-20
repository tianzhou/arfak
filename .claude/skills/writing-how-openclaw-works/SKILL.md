---
name: writing-how-openclaw-works
description: Use when writing a new "How OpenClaw Works" blog post. Triggers on "openclaw", "how openclaw works", "new engineering post", "write a post about openclaw", or studying patterns from the OpenClaw codebase.
---

# Writing "How OpenClaw Works" Posts

A series studying patterns from the [OpenClaw](https://github.com/openclaw/openclaw) codebase. Each post picks one source file and explains the design behind it.

## File Setup

- **Location:** `website/content/blog/`
- **Filename:** `how-openclaw-works-TOPIC.mdx` (kebab-case)
- **Frontmatter:**

```yaml
---
title: "How OpenClaw Works #N — Topic Name"
date: "YYYY-MM-DD"
description: "How OpenClaw does X to achieve Y."
featured: false
category: "Engineering"
---
```

The `description` should mirror the post's thesis — what the reader will understand after reading.

## Post Structure

1. **Series intro** — One sentence linking the series and project.
2. **Source** — Permalink to the specific file (with commit hash).
3. **Key dependencies** — Bullet list. Each: linked name + why it's chosen over alternatives.
4. **The Problem** — 2-3 sentences. What breaks without this solution.
5. **Pipeline/Overview** — ASCII text diagram of the full flow.
6. **Walkthrough sections** — One `##` per stage. Pattern: heading → code block → 1-2 paragraph explanation.
7. **Takeaways** — Numbered list. `**Bold principle** — one-line explanation`.
8. **Teaser** — One sentence previewing the next post in the series.

## Templates

Opening:

```markdown
Post #N in **How OpenClaw Works** — a series studying patterns from the [OpenClaw](https://github.com/openclaw/openclaw) codebase, an open-source personal AI assistant.

Source: [`file.ts`](https://github.com/openclaw/openclaw/blob/COMMIT_HASH/src/path/to/file.ts)

**Key dependencies:**

- [library](https://github.com/org/library) — Why this over the built-in alternative. What specific problem it solves.
```

Pipeline:

```markdown
## The Pipeline

\```
Input event
  → Stage 1
    → Stage 2
      → Stage 3
        → Output
\```
```

Takeaways:

```markdown
## Takeaways

1. **Principle one** — brief explanation
2. **Principle two** — brief explanation
```

## Voice

Write like an engineer explaining to a peer over coffee — not a tutorial, not a textbook.

- **Show the "why" before the "how."** Developers skip posts that jump straight to code without motivation. State the constraint or tradeoff that forced the design.
- **Respect the reader's time.** No filler, no throat-clearing ("In this post we will explore..."). Get to the point.
- **Let code speak.** A 10-line snippet with a one-sentence explanation beats three paragraphs of prose. Annotate the non-obvious, skip the obvious.
- **Name the tradeoffs.** "We chose X over Y because Z" resonates. Unqualified "X is best" doesn't.
- **Use concrete examples.** "Changing `cron.interval` from `"5m"` to `"10m"` returns `["cron.interval"]`" — not "when a config value changes, the diff returns the path."
- **No marketing language.** No "powerful", "seamless", "elegant", "robust". Describe what it does, not how it feels.

## Writing Style

- **Short paragraphs.** 2-3 sentences max.
- **Bold + em dash** for emphasis: `**bold text** — explanation`
- **Inline code** for config values, function names, paths
- **TypeScript** code blocks with `typescript` language tag
- **Tables** for comparisons (e.g., rule kinds, config modes)
- **No images.** ASCII diagrams and code blocks only.
- Show essential logic, not full files. Cut imports and boilerplate.

## Checklist

- [ ] Filename matches `how-openclaw-works-TOPIC.mdx`
- [ ] Title follows `"How OpenClaw Works #N — Topic Name"`
- [ ] Category is `"Engineering"`, featured is `false`
- [ ] Opens with series intro + source link + key dependencies
- [ ] Has "The Problem" section
- [ ] Has pipeline/overview diagram
- [ ] Each walkthrough section: heading → code → explanation
- [ ] Ends with numbered Takeaways
- [ ] Closes with teaser for next post
