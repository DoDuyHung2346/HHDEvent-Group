from typing import List, Tuple, Dict, Any, Optional
from app.llm import get_llm_client
from app.retrieval.hybrid import RetrievedCandidate
from app.rag.prompts import SYSTEM_PROMPT, build_system_prompt_with_staff
from app.rag.validate import LLMOut

def build_documents_context(candidates: List[RetrievedCandidate]) -> str:
    doc_blocks = []
    for i, c in enumerate(candidates, 1):
        block = f"[{i}] ({c.doc_title} › {c.breadcrumb})\n{c.text_display}"
        doc_blocks.append(block)
    return "\n\n".join(doc_blocks)

def generate_rag_answer(
    standalone_query: str,
    candidates: List[RetrievedCandidate],
    history_text: str = "",
    staff_context: Optional[List[Any]] = None
) -> Tuple[LLMOut, Dict[str, Any], str]:
    context_text = build_documents_context(candidates)
    user_prompt = f"""<documents>
{context_text}
</documents>
<history>
{history_text}
</history>
<user_question>
{standalone_query}
</user_question>"""

    # Inject staff context vào system prompt nếu có
    system_prompt = build_system_prompt_with_staff(staff_context) if staff_context else SYSTEM_PROMPT

    llm = get_llm_client()
    llm_out, usage = llm.generate_structured(
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        response_schema=LLMOut,
        temperature=0.2
    )

    return llm_out, usage, context_text
