"use client";

import { useState } from "react";
import Image from "next/image";
import { Search, Send, ArrowLeft } from "lucide-react";
import { conversations as initialConversations } from "@/lib/data";

export default function MessagesView() {
  const [conversations, setConversations] = useState(initialConversations);
  const [activeId, setActiveId] = useState(initialConversations[0].id);
  const [draft, setDraft] = useState("");
  // on mobile we only ever show one pane at a time
  const [mobilePane, setMobilePane] = useState<"list" | "thread">("list");

  const active = conversations.find((c) => c.id === activeId)!;

  const selectConversation = (id: string) => {
    setActiveId(id);
    setMobilePane("thread");
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, unread: false } : c)));
  };

  const sendMessage = () => {
    if (!draft.trim()) return;
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? {
              ...c,
              messages: [
                ...c.messages,
                { id: `m${c.messages.length + 1}`, fromMe: true, text: draft.trim(), time: "Now" }
              ]
            }
          : c
      )
    );
    setDraft("");
  };

  return (
    <div className="bg-white border border-line rounded-lg shadow-card overflow-hidden grid grid-cols-1 md:grid-cols-[300px_1fr] h-[75vh] md:h-[640px]">
      {/* conversation list — full width on mobile until a thread is opened */}
      <div
        className={`border-r border-line overflow-y-auto thin-scroll ${
          mobilePane === "thread" ? "hidden md:block" : "block"
        }`}
      >
        <div className="p-4 border-b border-line">
          <div className="flex items-center gap-2.5 bg-cream border border-line rounded-xl px-3 py-2.5">
            <Search size={16} className="text-muted shrink-0" />
            <input
              type="text"
              placeholder="Search messages..."
              className="bg-transparent outline-none text-[13.5px] w-full placeholder:text-muted"
            />
          </div>
        </div>
        {conversations.map((c) => (
          <button
            key={c.id}
            onClick={() => selectConversation(c.id)}
            className={`w-full flex gap-2.5 px-4 py-3.5 border-b border-line text-start transition-colors ${
              c.id === activeId ? "bg-cream border-s-[3px] border-s-gold ps-[13px]" : "hover:bg-cream"
            }`}
          >
            <Image src={c.avatar} alt={c.name} width={42} height={42} className="rounded-full object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between gap-1.5">
                <span className="text-[13.5px] font-bold truncate">{c.name}</span>
                <span className="text-[10.5px] text-muted whitespace-nowrap">{c.time}</span>
              </div>
              <div className="text-[12px] text-muted truncate mt-0.5">{c.preview}</div>
            </div>
            {c.unread && <div className="w-2 h-2 rounded-full bg-blue mt-1 shrink-0" />}
          </button>
        ))}
      </div>

      {/* thread — full width on mobile once opened, always visible from md up */}
      <div className={`flex-col h-full ${mobilePane === "list" ? "hidden md:flex" : "flex"}`}>
        <div className="flex items-center gap-3 px-4 md:px-[22px] py-4 border-b border-line shrink-0">
          <button
            onClick={() => setMobilePane("list")}
            aria-label="Back to conversations"
            className="md:hidden w-8 h-8 -ms-1 rounded-full flex items-center justify-center text-ink70 hover:bg-cream shrink-0"
          >
            <ArrowLeft size={18} />
          </button>
          <Image src={active.avatar} alt={active.name} width={38} height={38} className="rounded-full object-cover shrink-0" />
          <div className="min-w-0">
            <div className="text-[14.5px] font-bold truncate">{active.name}</div>
            <div className="text-[11.5px] text-sageDeep flex items-center gap-1.5">
              {active.online && <span className="w-[7px] h-[7px] rounded-full bg-sageDeep shrink-0" />}
              {active.online ? "Online · " : ""}
              {active.role}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto thin-scroll px-4 md:px-[22px] py-[22px] flex flex-col gap-3.5">
          {active.messages.map((m) => (
            <div key={m.id} className={`flex ${m.fromMe ? "justify-end" : "justify-start"}`}>
              <div className="max-w-[80%] sm:max-w-[62%]">
                <div
                  className={`px-4 py-2.5 text-[13.5px] leading-relaxed rounded-2xl ${
                    m.fromMe
                      ? "bg-blue text-white rounded-br-[4px]"
                      : "bg-cream border border-line rounded-bl-[4px]"
                  }`}
                >
                  {m.text}
                </div>
                <div className={`text-[10px] text-muted mt-1 ${m.fromMe ? "text-end" : ""}`}>{m.time}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2.5 px-4 py-3.5 border-t border-line shrink-0">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Write a message..."
            className="flex-1 min-w-0 border border-line bg-cream rounded-full px-4.5 py-2.5 text-[13.5px] outline-none focus:border-gold focus:bg-white"
          />
          <button
            onClick={sendMessage}
            className="w-[42px] h-[42px] rounded-full bg-ink text-white flex items-center justify-center shrink-0 hover:bg-blueDeep transition-colors"
          >
            <Send size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}
