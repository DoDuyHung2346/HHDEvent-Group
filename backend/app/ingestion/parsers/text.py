from pathlib import Path
import unicodedata

def parse_text_file(path: Path) -> str:
    encodings = ["utf-8", "utf-8-sig", "cp1258", "latin-1"]
    content = ""
    for enc in encodings:
        try:
            with open(path, "r", encoding=enc) as f:
                content = f.read()
            break
        except Exception:
            continue
    if not content:
        raise ValueError(f"Không thể đọc file {path.name} với các encoding hỗ trợ.")
    return unicodedata.normalize("NFC", content)
