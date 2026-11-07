from pathlib import Path
from typing import Tuple, List, Dict, Any
import pandas as pd
import unicodedata

def parse_excel_or_csv(path: Path) -> Tuple[str, List[Dict[str, Any]]]:
    suffix = path.suffix.lower()
    if suffix == ".csv":
        # Thử đọc utf-8 hoặc utf-8-sig
        try:
            df = pd.read_csv(path, encoding="utf-8")
        except Exception:
            df = pd.read_csv(path, encoding="latin-1")
        dfs = {"Sheet1": df}
    else:
        dfs = pd.read_excel(path, sheet_name=None)

    all_markdown = []
    tables_json: List[Dict[str, Any]] = []

    for sheet_name, df in dfs.items():
        if df.empty:
            continue
        df = df.fillna("")
        all_markdown.append(f"## {sheet_name}\n")
        
        # Tạo bảng Markdown
        md_table = df.to_markdown(index=False)
        all_markdown.append(md_table + "\n")

        # Tạo đoạn văn mô tả tự nhiên cho từng hàng
        row_descriptions = []
        records = df.to_dict(orient="records")
        for row in records:
            desc_parts = [f"{k}: {v}" for k, v in row.items() if str(v).strip()]
            if desc_parts:
                row_descriptions.append("- " + "; ".join(desc_parts))
        if row_descriptions:
            all_markdown.append("### Danh sách chi tiết:\n" + "\n".join(row_descriptions) + "\n")

        tables_json.append({
            "sheet": sheet_name,
            "columns": list(df.columns),
            "rows": records
        })

    full_text = "\n".join(all_markdown)
    return unicodedata.normalize("NFC", full_text), tables_json
