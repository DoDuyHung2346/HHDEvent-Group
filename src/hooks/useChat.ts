"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { ChatResponse, CustomerContext } from "@/lib/schemas";
import { loadStaffList } from "@/lib/staff/storage";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  response?: ChatResponse;
  timestamp: Date;
}

export function useChat(customerContext?: CustomerContext | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const historyRef = useRef<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const customerContextRef = useRef<CustomerContext | null | undefined>(customerContext);

  useEffect(() => {
    customerContextRef.current = customerContext;
  }, [customerContext]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}-user`,
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    // Cập nhật history
    historyRef.current = [
      ...historyRef.current,
      { role: "user" as const, content: text },
    ].slice(-12);

    // Lấy staff list từ localStorage để gửi kèm (đảm bảo LLM không bịa tên nhân viên)
    let staffContext: Array<{
      id: string; name: string; phone: string; roleLabel: string; shift: string; status: string;
    }> | undefined;
    try {
      const staffList = loadStaffList();
      if (staffList.length > 0) {
        staffContext = staffList.map((s) => ({
          id: s.id,
          name: s.name,
          phone: s.phone,
          roleLabel: s.roleLabel,
          shift: s.shift || "all_day",
          status: s.status,
        }));
      }
    } catch {
      // Nếu localStorage không available (SSR edge case), bỏ qua
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: historyRef.current.slice(0, -1), // Không gửi tin nhắn hiện tại
          customerContext: customerContextRef.current ?? undefined,
          staffContext,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error ?? `Lỗi ${res.status}`);
      }

      const data: ChatResponse = await res.json();

      const assistantMessage: Message = {
        id: `msg-${Date.now()}-assistant`,
        role: "assistant",
        content: data.answer,
        response: data,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Cập nhật history với response
      historyRef.current = [
        ...historyRef.current,
        { role: "assistant" as const, content: data.answer },
      ].slice(-12);
    } catch (err) {
      const errMsg =
        err instanceof Error
          ? err.message
          : "Đã xảy ra lỗi kết nối. Vui lòng thử lại.";
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const appendContext = useCallback(
    (role: "user" | "assistant", content: string) => {
      historyRef.current = [
        ...historyRef.current,
        { role, content },
      ].slice(-12);
    },
    []
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    historyRef.current = [];
    setError(null);
  }, []);

  return { messages, isLoading, error, sendMessage, clearMessages, appendContext };
}
