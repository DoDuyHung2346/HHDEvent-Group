from app.retrieval.tokenizer_vi import tokenize_vi, tokenize_ascii, expand_synonyms, normalize_text

def test_tokenize_vi_compound_words():
    text = "Công ty tổ chức sự kiện tại Hà Nội"
    tokens = tokenize_vi(text)
    assert "tổ_chức" in tokens
    assert "sự_kiện" in tokens
    assert "hà_nội" in tokens or ("hà" in tokens and "nội" in tokens)

def test_tokenize_ascii():
    text = "Báo giá gói tiệc cưới trọn gói"
    tokens = tokenize_ascii(text)
    assert "bao" in tokens
    assert "gia" in tokens
    assert "tiec" in tokens
    assert "cuoi" in tokens
    assert "tron" in tokens
    assert "goi" in tokens

def test_expand_synonyms():
    text = "chi phí tổ chức year end party"
    expanded = expand_synonyms(text)
    # Phải chứa từ đồng nghĩa như bao gia, ngan sach, tat nien
    assert "gia" in expanded or "bao gia" in expanded or "tat nien" in expanded

def test_empty_and_special_chars():
    assert tokenize_vi("") == []
    assert tokenize_ascii("") == []
    assert tokenize_vi("!@#$%^&*()_+") == []
