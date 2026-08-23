import os
import re
import json
import networkx as nx

ROOT = os.path.abspath(".")
OUTPUT_DIR = os.path.join(ROOT, ".code-intelligence")

IGNORE = {
    ".git",
    "node_modules",
    "dist",
    ".codegraph-venv",
}

GRAPH = nx.DiGraph()


def rel(path):
    return os.path.relpath(path, ROOT)


def add_node(node_id, node_type, path=None, name=None):
    data = {"type": node_type}

    if path:
        data["path"] = rel(path)

    if name:
        data["name"] = name

    GRAPH.add_node(node_id, **data)


def add_edge(source, target, relation):
    GRAPH.add_edge(
        source,
        target,
        relation=relation
    )


def clean_path(path):
    path = path.split("?")[0].split("#")[0]
    return path


def resolve_import(source_file, import_path):
    if not import_path.startswith("."):
        return None

    base = os.path.dirname(source_file)
    target = os.path.normpath(
        os.path.join(base, import_path)
    )

    candidates = [
        target,
        target + ".js",
        target + ".jsx",
        target + ".ts",
        target + ".tsx",
        target + ".css",
        os.path.join(target, "index.js"),
        os.path.join(target, "index.css"),
    ]

    for candidate in candidates:
        full = os.path.abspath(candidate)

        if os.path.isfile(full):
            return full

    return None


def analyze_js(path):
    file_id = f"file:{rel(path)}"

    add_node(
        file_id,
        "javascript",
        path=path
    )

    try:
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
    except Exception:
        return

    # ES module imports
    imports = re.findall(
        r'import\s+(?:.*?\s+from\s+)?[\'"]([^\'"]+)[\'"]',
        content
    )

    # Dynamic imports
    imports += re.findall(
        r'import\(\s*[\'"]([^\'"]+)[\'"]\s*\)',
        content
    )

    # CommonJS
    imports += re.findall(
        r'require\(\s*[\'"]([^\'"]+)[\'"]\s*\)',
        content
    )

    for imp in set(imports):
        target = resolve_import(path, imp)

        if target:
            target_id = f"file:{rel(target)}"

            add_node(
                target_id,
                "source",
                path=target
            )

            add_edge(
                file_id,
                target_id,
                "imports"
            )

        else:
            module_id = f"module:{imp}"

            add_node(
                module_id,
                "external_module",
                name=imp
            )

            add_edge(
                file_id,
                module_id,
                "depends_on"
            )

    # Function declarations
    functions = re.findall(
        r'(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(',
        content
    )

    # Arrow functions assigned to variables
    functions += re.findall(
        r'(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>',
        content
    )

    for function in sorted(set(functions)):
        function_id = f"function:{rel(path)}:{function}"

        add_node(
            function_id,
            "function",
            path=path,
            name=function
        )

        add_edge(
            file_id,
            function_id,
            "defines"
        )


def analyze_html(path):
    file_id = f"file:{rel(path)}"

    add_node(
        file_id,
        "html",
        path=path
    )

    try:
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
    except Exception:
        return

    # script src
    scripts = re.findall(
        r'<script[^>]+src=["\']([^"\']+)["\']',
        content,
        re.I
    )

    # CSS
    styles = re.findall(
        r'<link[^>]+href=["\']([^"\']+\.css[^"\']*)["\']',
        content,
        re.I
    )

    # HTML links
    links = re.findall(
        r'<a[^>]+href=["\']([^"\']+)["\']',
        content,
        re.I
    )

    for reference in scripts + styles + links:
        reference = clean_path(reference)

        if reference.startswith(("http://", "https://", "#", "mailto:")):
            continue

        target = os.path.abspath(
            os.path.join(
                os.path.dirname(path),
                reference
            )
        )

        if os.path.isfile(target):
            target_id = f"file:{rel(target)}"

            add_node(
                target_id,
                "source",
                path=target
            )

            add_edge(
                file_id,
                target_id,
                "references"
            )


def analyze_css(path):
    file_id = f"file:{rel(path)}"

    add_node(
        file_id,
        "css",
        path=path
    )

    try:
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
    except Exception:
        return

    imports = re.findall(
        r'@import\s+[\'"]([^\'"]+)[\'"]',
        content
    )

    for imp in imports:
        target = resolve_import(path, imp)

        if target:
            target_id = f"file:{rel(target)}"

            add_node(
                target_id,
                "css",
                path=target
            )

            add_edge(
                file_id,
                target_id,
                "imports"
            )


def scan():
    for root, dirs, files in os.walk(ROOT):

        dirs[:] = [
            d for d in dirs
            if d not in IGNORE
        ]

        for filename in files:
            path = os.path.join(root, filename)

            if filename.endswith((".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs")):
                analyze_js(path)

            elif filename.endswith(".html"):
                analyze_html(path)

            elif filename.endswith(".css"):
                analyze_css(path)


def export():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    nodes = []

    for node, attrs in GRAPH.nodes(data=True):
        nodes.append({
            "id": node,
            **attrs
        })

    edges = []

    for source, target, attrs in GRAPH.edges(data=True):
        edges.append({
            "source": source,
            "target": target,
            **attrs
        })

    graph = {
        "project": os.path.basename(ROOT),
        "description": "AI-oriented structural map of the project",
        "nodes": nodes,
        "edges": edges,
        "statistics": {
            "nodes": len(nodes),
            "edges": len(edges)
        }
    }

    with open(
        os.path.join(OUTPUT_DIR, "graph.json"),
        "w",
        encoding="utf-8"
    ) as f:
        json.dump(graph, f, indent=2)

    # Human-readable architecture map
    with open(
        os.path.join(OUTPUT_DIR, "architecture.md"),
        "w",
        encoding="utf-8"
    ) as f:

        f.write("# Project Architecture Map\n\n")
        f.write(f"Project: `{os.path.basename(ROOT)}`\n\n")

        f.write("## Statistics\n\n")
        f.write(f"- Nodes: {len(nodes)}\n")
        f.write(f"- Relationships: {len(edges)}\n\n")

        f.write("## Files\n\n")

        for node in nodes:
            if node["type"] in {
                "javascript",
                "html",
                "css"
            }:
                f.write(
                    f"- `{node.get('path', '')}` "
                    f"({node['type']})\n"
                )

        f.write("\n## Relationships\n\n")

        for edge in edges:
            f.write(
                f"- `{edge['source']}` "
                f"→ **{edge['relation']}** → "
                f"`{edge['target']}`\n"
            )

    # Mermaid diagram
    with open(
        os.path.join(OUTPUT_DIR, "graph.mmd"),
        "w",
        encoding="utf-8"
    ) as f:

        f.write("graph TD\n")

        for source, target, attrs in GRAPH.edges(data=True):

            s = source.replace('"', "'")
            t = target.replace('"', "'")

            f.write(
                f'    "{s}" -->|{attrs["relation"]}| "{t}"\n'
            )

    print()
    print("===================================")
    print(" AI CODE GRAPH GENERATED")
    print("===================================")
    print(f"Nodes: {len(nodes)}")
    print(f"Edges: {len(edges)}")
    print()
    print(f"Output: {OUTPUT_DIR}/")
    print()
    print("Files:")
    print("  graph.json")
    print("  architecture.md")
    print("  graph.mmd")
    print()


if __name__ == "__main__":
    scan()
    export()
