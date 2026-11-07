/**
 * One configuration contract for both the RAG backend and the Next.js
 * fallback. Secrets remain server-only; this module must never be imported by
 * a client component.
 */
export function getAIConfig() {
  const apiKey =
    process.env.LLM_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.ANTHROPIC_API_KEY ||
    "";
  const baseURL = process.env.LLM_BASE_URL || process.env.AI_BASE_URL || "";
  const model =
    process.env.LLM_MODEL || process.env.AI_MODEL || "gemini-3.8-flash";

  return {
    apiKey,
    baseURL,
    model,
    isAnthropicNative: baseURL.includes("anthropic.com"),
  };
}

export function getAISafeStatus() {
  const config = getAIConfig();
  return {
    mode: process.env.AI_MODE || "real",
    model: config.model,
    provider: config.baseURL
      ? config.isAnthropicNative
        ? "Anthropic"
        : "OpenAI-compatible"
      : "RAG backend / Google Gemini",
    base_url_configured: Boolean(config.baseURL),
    api_key_configured: Boolean(config.apiKey),
  };
}
