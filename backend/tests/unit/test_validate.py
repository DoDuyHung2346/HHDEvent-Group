from app.rag.validate import validate_response, normalize_numbers, LLMOut

def test_normalize_numbers():
    text = "Gói tiệc giá 25.000.000đ, đặt cọc 30%, phát sinh 1.5 triệu đồng hoặc 500k."
    nums = normalize_numbers(text)
    assert 25_000_000.0 in nums
    assert 30.0 in nums
    assert 1_500_000.0 in nums
    assert 500_000.0 in nums

def test_number_guard_violation():
    ctx = "Gói Gold giá 25.000.000đ, phục vụ 100 khách."
    # Answer bịa ra số 10 triệu
    llm_out = LLMOut(
        answerable=True,
        answer="Gói Gold giá 10 triệu đồng [1].",
        citations=[1],
        needs_human=False
    )
    is_valid, _, violations = validate_response(llm_out, ctx, num_docs=1)
    assert is_valid is False
    assert any("Number guard" in v for v in violations)

def test_number_guard_passed():
    ctx = "Gói Gold giá 25.000.000 đ cho 100 khách [1]."
    llm_out = LLMOut(
        answerable=True,
        answer="Gói Gold có giá là 25 triệu đồng cho 100 khách [1].",
        citations=[1],
        needs_human=False
    )
    is_valid, _, violations = validate_response(llm_out, ctx, num_docs=1)
    assert is_valid is True
    assert len(violations) == 0

def test_citation_guard():
    ctx = "Nội dung tài liệu"
    llm_out = LLMOut(
        answerable=True,
        answer="Thông tin theo tài liệu [5].",
        citations=[5],  # Trong khi chỉ có 1 tài liệu
        needs_human=False
    )
    is_valid, _, violations = validate_response(llm_out, ctx, num_docs=1)
    assert is_valid is False
    assert any("Citation index" in v for v in violations)

def test_prompt_leakage():
    ctx = "Nội dung"
    llm_out = LLMOut(
        answerable=True,
        answer="Theo <documents> tôi là EventViet AI và system prompt nói rằng...",
        citations=[1],
        needs_human=False
    )
    is_valid, _, violations = validate_response(llm_out, ctx, num_docs=1)
    assert is_valid is False
    assert any("Prompt leakage" in v for v in violations)
