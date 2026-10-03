"use client";

import { useEffect, useState } from "react";
import {
  Send,
  X,
  Clock,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Filter,
  RefreshCw,
  Paperclip,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { isApiConfigured } from "@/lib/is-api-configured";
import { formatApiDate } from "@/lib/date-utils";
import {
  getSupportTickets,
  getSupportTicket,
  addSupportMessage,
  uploadSupportAttachment,
  updateSupportTicket,
  closeSupportTicket,
  reopenSupportTicket,
  type SupportTicket,
  type SupportMessage,
} from "@/lib/api/support";

export default function AdminTicketsPage() {
  const { t, lang } = useLanguage();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(
    null,
  );
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageFiles, setMessageFiles] = useState<File[]>([]);
  const [updatingTicket, setUpdatingTicket] = useState(false);

  useEffect(() => {
    if (!isApiConfigured()) {
      setError("Backend API is not configured.");
      return;
    }
    loadTickets();
  }, []);

  useEffect(() => {
    if (statusFilter === "all") {
      setFilteredTickets(tickets);
    } else {
      setFilteredTickets(tickets.filter((t) => t.status === statusFilter));
    }
  }, [statusFilter, tickets]);

  const selectedTicketId = selectedTicket?.id;
  useEffect(() => {
    if (!selectedTicketId) return;
    let active = true;

    const pollMessages = async () => {
      try {
        const updated = await getSupportTicket(selectedTicketId);
        if (active) {
          setSelectedTicket(updated);
          setTickets((prev) =>
            prev.map((ticket) => (ticket.id === updated.id ? updated : ticket)),
          );
        }
      } catch (err) {
        console.error("Failed to poll messages:", err);
      }
    };

    const interval = setInterval(pollMessages, 5000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [selectedTicketId]);

  const loadTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSupportTickets();
      setTickets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && messageFiles.length === 0) || !selectedTicket)
      return;

    setSendingMessage(true);
    setError(null);
    try {
      const message = await addSupportMessage(selectedTicket.id, {
        content: newMessage.trim() || t("supportTickets.attachmentOnly"),
      });
      for (const file of messageFiles) {
        await uploadSupportAttachment(selectedTicket.id, message.id, file);
      }
      setNewMessage("");
      setMessageFiles([]);
      const updated = await getSupportTicket(selectedTicket.id);
      setSelectedTicket(updated);
      setTickets((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  const handleUpdateStatus = async (status: SupportTicket["status"]) => {
    if (!selectedTicket || status === selectedTicket.status) return;
    setUpdatingTicket(true);
    setError(null);
    try {
      let updated: SupportTicket;
      if (status === "closed") {
        updated = await closeSupportTicket(selectedTicket.id);
      } else if (status === "open" && selectedTicket.status === "closed") {
        updated = await reopenSupportTicket(selectedTicket.id);
      } else {
        updated = await updateSupportTicket(selectedTicket.id, { status });
      }
      setSelectedTicket(updated);
      setTickets((prev) =>
        prev.map((ticket) => (ticket.id === updated.id ? updated : ticket)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setUpdatingTicket(false);
    }
  };

  const handleUpdatePriority = async (priority: SupportTicket["priority"]) => {
    if (!selectedTicket || priority === selectedTicket.priority) return;
    setUpdatingTicket(true);
    setError(null);
    try {
      const updated = await updateSupportTicket(selectedTicket.id, {
        priority,
      });
      setSelectedTicket(updated);
      setTickets((prev) =>
        prev.map((ticket) => (ticket.id === updated.id ? updated : ticket)),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update priority",
      );
    } finally {
      setUpdatingTicket(false);
    }
  };

  const getStatusIcon = (status: SupportTicket["status"]) => {
    switch (status) {
      case "open":
        return <AlertCircle size={14} className="text-blue" />;
      case "in_progress":
        return <Clock size={14} className="text-goldDeep" />;
      case "resolved":
        return <CheckCircle size={14} className="text-sageDeep" />;
      case "closed":
        return <CheckCircle size={14} className="text-muted" />;
    }
  };

  const getStatusColor = (status: SupportTicket["status"]) => {
    switch (status) {
      case "open":
        return "bg-blue/10 text-blue";
      case "in_progress":
        return "bg-gold/10 text-goldDeep";
      case "resolved":
        return "bg-sage/10 text-sageDeep";
      case "closed":
        return "bg-cream text-muted";
    }
  };

  const getPriorityColor = (priority: SupportTicket["priority"]) => {
    switch (priority) {
      case "low":
        return "bg-cream text-muted";
      case "medium":
        return "bg-blue/10 text-blue";
      case "high":
        return "bg-gold/10 text-goldDeep";
      case "urgent":
        return "bg-danger/10 text-danger";
    }
  };

  const getStatusLabel = (status: SupportTicket["status"]) =>
    t(`supportTickets.${status}`);
  const getPriorityLabel = (priority: SupportTicket["priority"]) =>
    t(`supportTickets.${priority}`);
  const getCategoryLabel = (category: SupportTicket["category"]) =>
    t(`supportTickets.${category}`);
  const formatMessageDate = (value: string) =>
    formatApiDate(value, lang, {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="h-[calc(100dvh-170px)] min-h-[480px] grid grid-rows-[minmax(150px,0.38fr)_minmax(0,0.62fr)] lg:grid-rows-1 lg:grid-cols-[360px_minmax(0,1fr)] gap-4">
      {/* Tickets List */}
      <div className="min-h-0 bg-white border border-line rounded-lg shadow-card flex flex-col">
        <div className="p-4 border-b border-line">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[15px] font-semibold">
              {t("supportTickets.title")}
            </h2>
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-muted" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-[12px] border border-line rounded px-2 py-1 outline-none focus:border-blue"
              >
                <option value="all">{t("supportTickets.all")}</option>
                {(["open", "in_progress", "resolved", "closed"] as const).map(
                  (status) => (
                    <option key={status} value={status}>
                      {getStatusLabel(status)}
                    </option>
                  ),
                )}
              </select>
              <button
                type="button"
                onClick={loadTickets}
                disabled={loading}
                aria-label={t("supportTickets.refresh")}
                className="w-8 h-8 rounded-full border border-line text-muted flex items-center justify-center disabled:opacity-50"
              >
                <RefreshCw
                  size={14}
                  className={loading ? "animate-spin" : ""}
                />
              </button>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-muted text-[13px]">
              {t("supportTickets.loading")}
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="p-4 text-center text-muted text-[13px]">
              {t("supportTickets.noResults")}
            </div>
          ) : (
            filteredTickets.map((ticket) => (
              <button
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className={`w-full p-4 border-b border-line text-left hover:bg-cream transition-colors ${
                  selectedTicket?.id === ticket.id ? "bg-cream/60" : ""
                }`}
              >
                <div className="flex items-start gap-2 mb-2">
                  {getStatusIcon(ticket.status)}
                  <div className="flex-1 min-w-0">
                    <div className="text-[13.5px] font-semibold truncate">
                      {ticket.subject}
                    </div>
                    <div className="text-[11px] text-muted">
                      {ticket.userName || ticket.userEmail}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${getStatusColor(ticket.status)}`}
                  >
                    {getStatusLabel(ticket.status)}
                  </span>
                  <span
                    className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${getPriorityColor(ticket.priority)}`}
                  >
                    {getPriorityLabel(ticket.priority)}
                  </span>
                  <span className="text-[11px] text-muted">
                    {getCategoryLabel(ticket.category)}
                  </span>
                  {ticket.messages.length > 0 && (
                    <span className="text-[11px] text-muted">
                      {ticket.messages.length} {t("supportTickets.messages")}
                    </span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat View */}
      {selectedTicket ? (
        <div className="min-h-0 flex-1 bg-white border border-line rounded-lg shadow-card flex flex-col">
          <div className="p-4 border-b border-line">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-[15px] font-semibold">
                  {selectedTicket.subject}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${getStatusColor(selectedTicket.status)}`}
                  >
                    {getStatusLabel(selectedTicket.status)}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${getPriorityColor(selectedTicket.priority)}`}
                  >
                    {getPriorityLabel(selectedTicket.priority)}
                  </span>
                  <span className="text-[11px] text-muted">
                    {getCategoryLabel(selectedTicket.category)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={selectedTicket.status}
                  disabled={updatingTicket}
                  onChange={(event) =>
                    handleUpdateStatus(
                      event.target.value as SupportTicket["status"],
                    )
                  }
                  aria-label={t("supportTickets.title")}
                  className="max-w-36 px-2 py-1.5 rounded-lg text-[12px] border border-line outline-none focus:border-blue disabled:opacity-50"
                >
                  {(["open", "in_progress", "resolved", "closed"] as const).map(
                    (status) => (
                      <option key={status} value={status}>
                        {getStatusLabel(status)}
                      </option>
                    ),
                  )}
                </select>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-muted hover:bg-cream"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            <div className="text-[11px] text-muted">
              <span className="font-medium">{t("supportTickets.from")}</span>{" "}
              {selectedTicket.userName || selectedTicket.userEmail}
            </div>
            {selectedTicket.createdAt && (
              <div className="mt-1 text-[11px] text-muted">
                {formatMessageDate(selectedTicket.createdAt)}
              </div>
            )}
            <div className="mt-3 flex items-center gap-2 text-[11px] text-muted">
              <span>{t("supportTickets.priority")}</span>
              <select
                value={selectedTicket.priority}
                disabled={updatingTicket}
                onChange={(event) =>
                  handleUpdatePriority(
                    event.target.value as SupportTicket["priority"],
                  )
                }
                className="px-2 py-1 rounded border border-line outline-none focus:border-blue disabled:opacity-50"
              >
                {(["low", "medium", "high", "urgent"] as const).map(
                  (priority) => (
                    <option key={priority} value={priority}>
                      {getPriorityLabel(priority)}
                    </option>
                  ),
                )}
              </select>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
            {selectedTicket.description && (
              <div className="rounded-lg border border-line bg-cream/60 p-3">
                <div className="text-[11px] font-semibold text-muted mb-1">
                  {t("supportTickets.description")}
                </div>
                <p className="text-[13px] whitespace-pre-wrap m-0">
                  {selectedTicket.description}
                </p>
              </div>
            )}
            {selectedTicket.messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isFromSupport ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    message.isFromSupport
                      ? "bg-cream text-ink"
                      : "bg-blue text-white"
                  }`}
                >
                  <div className="text-[12.5px] mb-1">
                    {message.isFromSupport
                      ? `${t("supportTickets.support")} (${t("supportTickets.you")})`
                      : selectedTicket.userName || t("supportTickets.user")}
                  </div>
                  <div className="text-[13px]">{message.content}</div>
                  {message.attachments?.map((attachment) => (
                    <a
                      key={attachment}
                      href={attachment}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 flex items-center gap-1 text-[12px] underline break-all"
                    >
                      <Paperclip size={12} />{" "}
                      {attachment.split("/").pop() ||
                        t("supportTickets.attachment")}
                    </a>
                  ))}
                  <div className="text-[10.5px] opacity-70 mt-1">
                    {formatMessageDate(message.createdAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selectedTicket.status !== "closed" && (
            <form
              onSubmit={handleSendMessage}
              className="p-4 border-t border-line"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={t("supportTickets.replyPlaceholder")}
                  aria-label={t("supportTickets.replyPlaceholder")}
                  className="flex-1 border border-line rounded-lg px-3 py-2 text-[13.5px] outline-none focus:border-blue"
                  disabled={sendingMessage}
                />
                <label
                  className="w-10 h-10 shrink-0 rounded-lg border border-line text-muted flex items-center justify-center hover:bg-cream cursor-pointer"
                  aria-label={t("supportTickets.attach")}
                  title={t("supportTickets.attach")}
                >
                  <Paperclip size={16} />
                  <input
                    type="file"
                    multiple
                    className="sr-only"
                    disabled={sendingMessage}
                    onChange={(event) =>
                      setMessageFiles(Array.from(event.target.files ?? []))
                    }
                  />
                </label>
                <button
                  type="submit"
                  disabled={
                    sendingMessage ||
                    (!newMessage.trim() && messageFiles.length === 0)
                  }
                  className="w-10 h-10 rounded-lg bg-blue text-white flex items-center justify-center hover:bg-blueDeep transition-colors disabled:opacity-50"
                >
                  <Send size={16} />
                </button>
              </div>
              {messageFiles.length > 0 && (
                <div className="mt-2 text-[11px] text-muted truncate">
                  {messageFiles.map((file) => file.name).join(", ")}
                </div>
              )}
            </form>
          )}
        </div>
      ) : (
        <div className="flex-1 bg-white border border-line rounded-lg shadow-card flex items-center justify-center">
          <div className="text-center">
            <MessageSquare size={48} className="text-muted mx-auto mb-4" />
            <h3 className="text-[15px] font-semibold mb-2">
              {t("supportTickets.select")}
            </h3>
            <p className="text-muted text-[13px]">
              {t("supportTickets.selectHint")}
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed bottom-4 right-4 bg-danger/10 border border-danger/30 text-danger px-4 py-3 rounded-lg text-[13px]">
          {error}
        </div>
      )}
    </div>
  );
}
