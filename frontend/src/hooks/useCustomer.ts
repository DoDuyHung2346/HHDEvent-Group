"use client";

import { useState, useCallback, useEffect } from "react";
import type { Customer, ChatSession, SessionMessage } from "@/lib/schemas";
import {
  getCustomer,
  upsertCustomer,
  getCustomerSessions,
  createSession,
  addMessageToSession,
  updateCustomerMemory,
  getSession,
  loadCustomers,
  loadSessions,
  saveCustomers,
  saveSessions,
} from "@/lib/customer/storage";
import { fetchRemoteHistory, syncRemoteCustomer, syncRemoteMessage, syncRemoteSession } from "@/lib/customer/api";

export function useCustomer(phone: string | null) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // ── Load database trước; localStorage chỉ là cache/fallback khi mất mạng. ──
  const loadHistory = useCallback(() => {
    if (!phone || !phone.trim()) {
      setCustomer(null);
      setSessions([]);
      setCurrentSession(null);
      setIsLoading(false);
      return;
    }

    const trimmedPhone = phone.trim();
    const loadedCustomer = getCustomer(trimmedPhone);
    const loadedSessions = getCustomerSessions(trimmedPhone);

    setCustomer(loadedCustomer);
    setSessions(loadedSessions);

    // Giữ currentSession nếu còn thuộc loadedSessions, ngược lại lấy session mới nhất
    setCurrentSession((prev) => {
      if (prev) {
        const refreshed = loadedSessions.find((s) => s.id === prev.id);
        if (refreshed) return refreshed;
      }
      return loadedSessions.length > 0 ? loadedSessions[0] : null;
    });

    setIsLoading(false);

    void fetchRemoteHistory(trimmedPhone)
      .then(({ customer: remoteCustomer, sessions: remoteSessions }) => {
        if (!remoteCustomer) return;
        const customers = loadCustomers();
        customers[trimmedPhone] = remoteCustomer;
        saveCustomers(customers);
        const allSessions = loadSessions();
        for (const session of remoteSessions) allSessions[session.id] = session;
        saveSessions(allSessions);
        setCustomer(remoteCustomer);
        setSessions(remoteSessions);
        setCurrentSession((current) => current ?? remoteSessions[0] ?? null);
      })
      .catch(() => {
        // Cache local vẫn cho phép demo tiếp tục khi Internet/Supabase tạm lỗi.
      });
  }, [phone]);

  useEffect(() => {
    void Promise.resolve().then(loadHistory);
  }, [loadHistory]);

  // ── Khởi tạo hoặc cập nhật hồ sơ khách hàng ────────────────────────────────
  const initCustomer = useCallback(
    (targetPhone: string, initialData?: Partial<Customer>) => {
      const normalized = targetPhone.trim();
      if (!normalized) return null;

      const updatedCustomer = upsertCustomer(normalized, initialData ?? {});
      let customerSessions = getCustomerSessions(normalized);

      let activeSession: ChatSession;
      if (customerSessions.length === 0) {
        activeSession = createSession(normalized);
        customerSessions = [activeSession];
      } else {
        activeSession = customerSessions[0];
      }

      setCustomer(updatedCustomer);
      setSessions(customerSessions);
      setCurrentSession(activeSession);
      void syncRemoteCustomer(updatedCustomer).catch(() => undefined);
      void syncRemoteSession(activeSession).catch(() => undefined);
      return { customer: updatedCustomer, session: activeSession };
    },
    []
  );

  // ── Thêm tin nhắn vào phiên chat hiện tại ──────────────────────────────────
  const saveMessage = useCallback(
    (message: Omit<SessionMessage, "id">, targetSessionId?: string) => {
      let activeSessionId = targetSessionId ?? currentSession?.id;

      // Nếu chưa có session và có phone, tự tạo session mới
      if (!activeSessionId) {
        if (!phone || !phone.trim()) return;
        const newSess = createSession(phone.trim());
        activeSessionId = newSess.id;
        setCurrentSession(newSess);
      }

      addMessageToSession(activeSessionId, message);

      void syncRemoteMessage(activeSessionId, message).catch(() => undefined);

      // Đồng bộ state sau khi thêm tin nhắn
      const freshSession = getSession(activeSessionId);
      if (freshSession) {
        setCurrentSession(freshSession);
      }

      if (phone && phone.trim()) {
        const freshSessions = getCustomerSessions(phone.trim());
        setSessions(freshSessions);
        setCustomer(getCustomer(phone.trim()));
      }
    },
    [currentSession?.id, phone]
  );

  // ── Cập nhật ghi nhớ ngữ cảnh (Memory) của khách hàng ───────────────────────
  const updateMemory = useCallback(
    (memory: {
      preferredEventType?: string;
      budgetMentioned?: string;
      guestCountMentioned?: string;
      eventDateMentioned?: string;
      notes?: string;
    }) => {
      if (!phone || !phone.trim()) return;
      const normalized = phone.trim();

      if (memory.notes !== undefined) {
        upsertCustomer(normalized, memory);
      } else {
        updateCustomerMemory(normalized, memory);
      }

      setCustomer(getCustomer(normalized));
      const syncedCustomer = getCustomer(normalized);
      if (syncedCustomer) void syncRemoteCustomer(syncedCustomer).catch(() => undefined);
    },
    [phone]
  );

  // ── Mở một phiên chat mới cho khách hàng ───────────────────────────────────
  const startNewSession = useCallback((): ChatSession | null => {
    if (!phone || !phone.trim()) return null;
    const newSession = createSession(phone.trim());
    const freshSessions = getCustomerSessions(phone.trim());

    setCurrentSession(newSession);
    setSessions(freshSessions);
    setCustomer(getCustomer(phone.trim()));
    void syncRemoteSession(newSession).catch(() => undefined);
    return newSession;
  }, [phone]);

  // ── Chuyển đổi phiên chat đang xem ─────────────────────────────────────────
  const switchSession = useCallback(
    (sessionId: string) => {
      const selected = sessions.find((s) => s.id === sessionId);
      if (selected) {
        setCurrentSession(selected);
      } else {
        const fetched = getSession(sessionId);
        if (fetched) setCurrentSession(fetched);
      }
    },
    [sessions]
  );

  return {
    customer,
    sessions,
    currentSession,
    isLoading,
    initCustomer,
    saveMessage,
    updateMemory,
    loadHistory,
    startNewSession,
    switchSession,
  };
}
