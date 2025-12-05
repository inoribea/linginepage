from pathlib import Path
import re


def scrub_file(path: Path) -> None:
    text = path.read_text(encoding="utf-8")
    updated = re.sub(r'(<textarea id="creative-input"[^>]*?)\s+placeholder="[^"]*"', r"\1", text, count=1)
    updated = re.sub(r'(<textarea id="user-input"[^>]*?)\s+placeholder="[^"]*"', r"\1", updated, count=1)
    updated = re.sub(r"\s*<figcaption[^>]*>.*?</figcaption>", "", updated, count=1, flags=re.S)
    if updated != text:
        path.write_text(updated, encoding="utf-8")


if __name__ == "__main__":
    scrub_file(Path("index.reordered.html"))
