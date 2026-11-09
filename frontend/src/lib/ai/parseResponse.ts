import type { ChatResponse } from "@/lib/schemas";
import { ChatResponseSchema } from "@/lib/schemas";

/**
 * Strip markdown code fences if AI returns ```json ... ```
 */
function stripCodeFences(text: string): string {
  return text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
}

/**
 * Parse và validate response từ AI.
 * Trả về ChatResponse nếu hợp lệ, throws nếu không.
 */
export function parseAIResponse(rawText: string): ChatResponse {
  const stripped = stripCodeFences(rawText);
  const parsed = JSON.parse(stripped);
  const validated = ChatResponseSchema.parse(parsed);
  return validated;
}
