#!/usr/bin/env python3
"""Read-only checks for files that should not enter a public portfolio repository."""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path


BLOCKED_NAMES = {
    ".env",
    ".env.local",
    ".env.production",
    "id_rsa",
    "id_ed25519",
    "credentials.json",
}
BLOCKED_SUFFIXES = {".pem", ".key", ".p12", ".pfx", ".kdbx"}
IGNORED_PARTS = {".git", "node_modules", "__pycache__"}
SECRET_PATTERNS = {
    "private key": re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----"),
    "GitHub token": re.compile(r"\bgh[pousr]_[A-Za-z0-9_]{20,}\b"),
    "OpenAI-style key": re.compile(r"\bsk-[A-Za-z0-9_-]{20,}\b"),
    "AWS access key": re.compile(r"\bAKIA[0-9A-Z]{16}\b"),
}


def files_under(root: Path):
    for path in root.rglob("*"):
        if not path.is_file() or any(part in IGNORED_PARTS for part in path.parts):
            continue
        yield path


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("root", nargs="?", default=".", help="repository root")
    parser.add_argument("--large-mb", type=float, default=20.0)
    args = parser.parse_args()

    root = Path(args.root).resolve()
    critical: list[str] = []
    warnings: list[str] = []

    for path in files_under(root):
        relative = path.relative_to(root)
        lower_name = path.name.lower()
        if lower_name in BLOCKED_NAMES or path.suffix.lower() in BLOCKED_SUFFIXES:
            critical.append(f"blocked credential-like file: {relative}")

        size = path.stat().st_size
        if size > args.large_mb * 1024 * 1024:
            warnings.append(f"large file ({size / 1024 / 1024:.1f} MiB): {relative}")

        if size > 2 * 1024 * 1024:
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except (UnicodeDecodeError, OSError):
            continue
        for label, pattern in SECRET_PATTERNS.items():
            if pattern.search(text):
                critical.append(f"possible {label}: {relative}")

    for item in warnings:
        print(f"WARN: {item}")
    for item in critical:
        print(f"FAIL: {item}")

    if critical:
        print(f"Publication audit failed with {len(critical)} critical finding(s).")
        return 1
    print(f"Publication audit passed for {root} with {len(warnings)} warning(s).")
    print("Manual review of personal data, image rights, and staged files is still required.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
