# AI Codebase Map

This repository has an external structural code graph.

## Code Intelligence

- Graph: .code-intelligence/graph.json
- Architecture: .code-intelligence/architecture.md
- Mermaid graph: .code-intelligence/graph.mmd

## Instructions for AI coding agents

Before exploring the repository:

1. Read CODEBASE_MAP.md.
2. Read .code-intelligence/architecture.md.
3. Use .code-intelligence/graph.json to identify relevant files and relationships.
4. Only inspect source files relevant to the current task.
5. Do not unnecessarily read the entire repository.
6. Do not manually inspect node_modules/.
7. Treat dist/ as generated output unless the task specifically requires it.
8. Prefer source files over generated files.

## Main source areas

- index.html
- pages/
- components/
- js/
- css/
- script.js
- style.css
- build.js
- tailwind.config.cjs
- assets/
- docs/

## Regenerating the graph

After significant structural changes:

    source .codegraph-venv/bin/activate
    python build_codegraph.py

The code graph is a structural map, not a replacement for source code. Use it to find relevant files first, then inspect those files when implementation details are needed.
