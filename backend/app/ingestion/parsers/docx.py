from pathlib import Path
import docx
import unicodedata

def parse_docx_file(path: Path) -> str:
    doc = docx.Document(path)
    lines = []
    
    for element in doc.element.body:
        tag = element.tag.split("}")[-1] if "}" in element.tag else element.tag
        if tag == "p":
            p = docx.text.paragraph.Paragraph(element, doc)
            text = p.text.strip()
            if not text:
                continue
            style_name = p.style.name.lower() if p.style else ""
            if "heading 1" in style_name:
                lines.append(f"# {text}\n")
            elif "heading 2" in style_name:
                lines.append(f"## {text}\n")
            elif "heading 3" in style_name:
                lines.append(f"### {text}\n")
            elif "list" in style_name:
                lines.append(f"- {text}")
            else:
                lines.append(f"{text}\n")
        elif tag == "tbl":
            table = docx.table.Table(element, doc)
            table_md = []
            for r_idx, row in enumerate(table.rows):
                cells = [c.text.replace("\n", " ").strip() for c in row.cells]
                row_str = "| " + " | ".join(cells) + " |"
                table_md.append(row_str)
                if r_idx == 0:
                    sep = "| " + " | ".join(["---"] * len(cells)) + " |"
                    table_md.append(sep)
            if table_md:
                lines.append("\n" + "\n".join(table_md) + "\n")

    full_text = "\n".join(lines)
    return unicodedata.normalize("NFC", full_text)
