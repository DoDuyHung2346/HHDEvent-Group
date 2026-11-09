export interface FAQ {
  id: string;
  question: string;
  answer: string;
  tags: string[];
  followups: string[];
}

export interface HistoryMessage {
  role: "user" | "assistant";
  content: string;
}

export interface KBDocument {
  id: string;
  title: string;
  category: "venue" | "pricing" | "process" | "team" | "policy";
  tags: string[];
  content: string;
}
