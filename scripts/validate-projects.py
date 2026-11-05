#!/usr/bin/env python3
"""Validate project image paths and external links in the portfolio data."""

import json
import sys
from pathlib import Path
from urllib.parse import unquote, urlsplit


ROOT = Path(__file__).resolve().parents[1]
DATA_FILE = ROOT / "projects" / "data" / "projects.json"
# Image URLs in projects.json are authored relative to projects/projects.html.
PAGE_BASE = ROOT / "projects"


def main() -> int:
    try:
        projects = json.loads(DATA_FILE.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        print(f"Cannot read project data: {error}", file=sys.stderr)
        return 1

    issues: list[str] = []
    if not isinstance(projects, list):
        print("Project data must be a JSON array.", file=sys.stderr)
        return 1

    for index, project in enumerate(projects, start=1):
        name = project.get("name", f"project #{index}")
        image_paths = [
            (f"images[{image_index}].src", image.get("src"))
            for image_index, image in enumerate(project.get("images", []), start=1)
        ]
        image_paths.extend(
            (field, project.get(field))
            for field in ("homeImage", "compactImage")
            if project.get(field)
        )

        for field, value in image_paths:
            if not isinstance(value, str) or not value:
                issues.append(f"{name}: {field} must be a nonempty local path")
                continue
            parsed = urlsplit(value)
            if parsed.scheme or parsed.netloc or value.startswith("/"):
                issues.append(f"{name}: {field} must be a relative local path: {value}")
                continue
            disk_path = (PAGE_BASE / unquote(parsed.path)).resolve()
            if not disk_path.is_relative_to(ROOT) or not disk_path.is_file():
                issues.append(f"{name}: {field} does not exist: {value}")

        links = project.get("links", {})
        if not links.get("github"):
            issues.append(f"{name}: GitHub link is required")
        for label, value in links.items():
            if value and (not isinstance(value, str) or urlsplit(value).scheme != "https"):
                issues.append(f"{name}: nonempty link '{label}' must use HTTPS: {value}")

    if issues:
        print("Project data validation failed:")
        for issue in issues:
            print(f"- {issue}")
        return 1

    print(f"Validated {len(projects)} projects: image paths and links are valid.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
