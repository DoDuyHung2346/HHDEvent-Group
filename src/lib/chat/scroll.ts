export interface AiMessageScrollInput {
  /** Vị trí top của tin nhắn so với ĐẦU nội dung cuộn (đã cộng scrollTop) */
  elTop: number;
  elHeight: number;
  /** container.clientHeight */
  viewportHeight: number;
  /** container.scrollHeight */
  scrollHeight: number;
  topPadding?: number;
}

export function getAiMessageScrollTop(i: AiMessageScrollInput): number {
  const pad = i.topPadding ?? 12;
  const maxTop = Math.max(0, i.scrollHeight - i.viewportHeight);
  if (i.elHeight + pad <= i.viewportHeight) return maxTop; // ngắn → xuống đáy
  return Math.min(maxTop, Math.max(0, i.elTop - pad)); // dài → neo đầu
}

