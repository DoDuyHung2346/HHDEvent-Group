"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, type RefObject } from "react";
import { getAiMessageScrollTop } from "@/lib/chat/scroll";

interface Params {
  containerRef: RefObject<HTMLDivElement | null>;
  lastMessage?: { id: string; sender: "ai" | "user" };
  isLoading: boolean;
  /** false khi tab Chat đang bị ẩn (display:none) */
  isActive: boolean;
}

export function useChatScroll({ containerRef, lastMessage, isLoading, isActive }: Params) {
  const savedTop = useRef(0);
  const handledId = useRef<string | null>(null);

  // display:none làm trình duyệt reset scrollTop → phải tự lưu liên tục
  const onScroll = useCallback(() => {
    const el = containerRef.current;
    if (el && el.clientHeight > 0) savedTop.current = el.scrollTop;
  }, [containerRef]);

  // (1) Quay lại tab: khôi phục vị trí (trừ khi có tin mới chưa được cuộn tới)
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!isActive || !el) return;
    if (lastMessage && lastMessage.id !== handledId.current) return;
    el.scrollTop = savedTop.current;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  // (2) Có tin nhắn mới
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!isActive || !el || !lastMessage || lastMessage.id === handledId.current) return;
    const behavior: ScrollBehavior = handledId.current === null ? "auto" : "smooth";
    handledId.current = lastMessage.id;

    if (lastMessage.sender === "user") {
      el.scrollTo({ top: el.scrollHeight, behavior });
      return;
    }

    const node = el.querySelector<HTMLElement>(`[data-msg-id="${CSS.escape(lastMessage.id)}"]`);
    if (!node) return;
    const elTop =
      node.getBoundingClientRect().top - el.getBoundingClientRect().top + el.scrollTop;
    el.scrollTo({
      top: getAiMessageScrollTop({
        elTop,
        elHeight: node.offsetHeight,
        viewportHeight: el.clientHeight,
        scrollHeight: el.scrollHeight,
      }),
      behavior,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastMessage?.id, isActive]);

  // (3) Bot đang gõ → cuộn xuống để thấy typing indicator
  useEffect(() => {
    const el = containerRef.current;
    if (isLoading && isActive && el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  return { onScroll };
}

