import type { FAQ } from "@/types";
import { buildSystemPrompt, buildUserMessage } from "./prompt";
import { parseAIResponse } from "./parseResponse";
import { getMockResponse } from "./mock";
import type { ChatResponse, CustomerContext } from "@/lib/schemas";
import { AI_TIMEOUT_MS } from "@/lib/constants";
import { getAIConfig } from "./config";

/**
 * Gọi AI qua OpenAI-compatible API (hoạt động với vilao.ai, OpenAI, Groq, etc.)
 */
async function callAI(
  message: string,
  history: Array<{ role: "user" | "assistant"; content: string }>,
  contextFAQs: FAQ[],
  customerContext?: CustomerContext | null
): Promise<string> {
  const { apiKey, baseURL, model, isAnthropicNative } = getAIConfig();
  if (!apiKey) {
    throw new Error("Chưa cấu hình LLM_API_KEY (hoặc GEMINI_API_KEY)");
  }
  if (!baseURL) {
    throw new Error("Fallback trực tiếp cần LLM_BASE_URL; hãy bật RAG backend để dùng Gemini native");
  }
  const askedQuestions = [
    ...history.filter((m) => m.role === "user").map((m) => m.content).slice(-3),
    message,
  ];
  const systemPrompt = buildSystemPrompt(contextFAQs, { customerContext, askedQuestions });
  const userMessages = buildUserMessage(message, history);

  // Xác định endpoint: Anthropic native hay OpenAI-compatible
  if (isAnthropicNative) {
    // Anthropic native format
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model,
      max_tokens: 1024,
      system: systemPrompt,
      messages: userMessages,
    });
    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text content in AI response");
    }
    return textBlock.text;
  } else {
    // OpenAI-compatible format (vilao.ai, Together, Groq, v.v.)
    const endpoint = baseURL.replace(/\/$/, "") + "/chat/completions";
    const body = {
      model,
      max_tokens: 1024,
      messages: [
        { role: "system", content: systemPrompt },
        ...userMessages,
      ],
    };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`AI API error ${res.status}: ${errText.slice(0, 200)}`);
    }

    const data = await res.json() as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("Empty AI response");
    return content;
  }
}

/**
 * Gọi AI với timeout 8s và retry 1 lần.
 * Nếu thất bại → fallback mock response.
 */
export async function callAIWithFallback(
  message: string,
  history: Array<{ role: "user" | "assistant"; content: string }>,
  contextFAQs: FAQ[],
  matchedFaqIds: string[],
  customerContext: CustomerContext | null = null
): Promise<ChatResponse> {
  // Chế độ mock
  if (process.env.AI_MODE === "mock") {
    return getMockResponse(message, matchedFaqIds);
  }

  const timeout = (ms: number) =>
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`AI timeout after ${ms}ms`)), ms)
    );

  // Attempt 1
  try {
    const raw = await Promise.race([
      callAI(message, history, contextFAQs, customerContext),
      timeout(AI_TIMEOUT_MS),
    ]);
    return parseAIResponse(raw);
  } catch (err1) {
    console.warn("[AI] Attempt 1 failed:", (err1 as Error).message);
    // Attempt 2 (retry 1 lần)
    try {
      const raw = await Promise.race([
        callAI(message, history, contextFAQs, customerContext),
        timeout(AI_TIMEOUT_MS),
      ]);
      return parseAIResponse(raw);
    } catch (err2) {
      console.warn("[AI] Attempt 2 failed, using mock:", (err2 as Error).message);
      return getMockResponse(message, matchedFaqIds);
    }
  }
}
