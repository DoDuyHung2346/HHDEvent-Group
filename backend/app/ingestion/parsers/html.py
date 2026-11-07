from pathlib import Path
from bs4 import BeautifulSoup
from markdownify import markdownify as md
import unicodedata

def parse_html_file(path: Path) -> str:
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        html_content = f.read()

    soup = BeautifulSoup(html_content, "html.parser")

    # Loại bỏ tags không cần thiết
    for tag in soup(["script", "style", "nav", "footer", "header", "noscript"]):
        tag.decompose()

    markdown_text = md(str(soup), heading_style="ATX")
    return unicodedata.normalize("NFC", markdown_text)
