/**
 * Messages store using localStorage for cross-tab sync between student and teacher dashboards.
 * Similar pattern to teacher slots store.
 */

import type { Conversation, Message } from "@/lib/data";

const MESSAGES_KEY = "se-one-messages";

// Seed data for conversations
const initialConversations: Conversation[] = [
  {
    id: "c1",
    name: "Ms. Harlow",
    role: "Speaking coach",
    avatar: "https://i.pravatar.cc/64?img=48",
    preview: "Great work on the speaking exercise! One note on...",
    time: "10:42 AM",
    unread: true,
    online: true,
    messages: [
      { id: "m1", fromMe: false, text: "Hi Sepanta! I listened to your recording from the café role-play — nicely done.", time: "10:30 AM" },
      { id: "m2", fromMe: false, text: "Great work on the speaking exercise! One note on pronunciation of \"th\" sounds, we can go over it in your next session.", time: "10:31 AM" },
      { id: "m3", fromMe: true, text: "Thank you! That would be really helpful, I still mix it up sometimes.", time: "10:38 AM" },
      { id: "m4", fromMe: false, text: "No problem at all, it's a common one. I'll send a few drills before Thursday's class.", time: "10:42 AM" }
    ]
  },
  {
    id: "c2",
    name: "Coach Daniel",
    role: "Grammar coach",
    avatar: "https://i.pravatar.cc/64?img=32",
    preview: "Your grammar worksheet has been graded.",
    time: "Yesterday",
    unread: false,
    online: false,
    messages: [
      { id: "m1", fromMe: false, text: "Your grammar worksheet has been graded — 96/100, really solid work.", time: "Yesterday" },
      { id: "m2", fromMe: true, text: "That's great to hear, thank you for the quick turnaround!", time: "Yesterday" }
    ]
  },
  {
    id: "c3",
    name: "Support Team",
    role: "Billing & account",
    avatar: "https://i.pravatar.cc/64?img=5",
    preview: "Thanks for reaching out — your invoice is attached.",
    time: "Mon",
    unread: false,
    online: false,
    messages: [
      { id: "m1", fromMe: true, text: "Hi, could I get a copy of last month's invoice?", time: "Mon" },
      { id: "m2", fromMe: false, text: "Thanks for reaching out — your invoice is attached to this thread.", time: "Mon" }
    ]
  },
  {
    id: "c4",
    name: "Study Group — B1",
    role: "4 members",
    avatar: "https://i.pravatar.cc/64?img=21",
    preview: "Amara: anyone free to practice Thursday?",
    time: "Sun",
    unread: false,
    online: false,
    messages: [
      { id: "m1", fromMe: false, text: "Amara: anyone free to practice Thursday?", time: "Sun" },
      { id: "m2", fromMe: true, text: "I should be free after 6pm!", time: "Sun" }
    ]
  }
];

export function loadMessages(): Conversation[] {
  if (typeof window === "undefined") return initialConversations;
  
  const stored = localStorage.getItem(MESSAGES_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return initialConversations;
    }
  }
  
  // Seed initial data
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(initialConversations));
  return initialConversations;
}

export function saveMessages(conversations: Conversation[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(conversations));
}

export function addMessage(conversationId: string, message: Message): Conversation[] {
  const conversations = loadMessages();
  const updated = conversations.map(c => {
    if (c.id === conversationId) {
      return {
        ...c,
        messages: [...c.messages, message],
        preview: message.text,
        time: message.time,
        unread: !message.fromMe // Mark as unread if message is from other person
      };
    }
    return c;
  });
  saveMessages(updated);
  return updated;
}

export function markAsRead(conversationId: string): Conversation[] {
  const conversations = loadMessages();
  const updated = conversations.map(c => 
    c.id === conversationId ? { ...c, unread: false } : c
  );
  saveMessages(updated);
  return updated;
}