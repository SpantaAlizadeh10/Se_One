"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Send,
  X,
  Clock,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Paperclip,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { isApiConfigured } from "@/lib/is-api-configured";
import { formatApiDate } from "@/lib/date-utils";
import {
  getSupportTickets,
  createSupportTicket,
  getSupportTicket,
  addSupportMessage,
  uploadSupportAttachment,
  type SupportTicket,
  type SupportMessage,
  type CreateTicketInput,
} from "@/lib/api/support";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default function StudentTicketsPage() {
  const { t, lang } = useLanguage();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(
    null,
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageFiles, setMessageFiles] = useState<File[]>([]);
  const [statusFilter, setStatusFilter] = useState<
    "all" | SupportTicket["status"]
  >("all");

  const [newTicket, setNewTicket] = useState<CreateTicketInput>({
    subject: "",
    category: "general",
    priority: "medium",
    description: "",
  });

  useEffect(() => {
    if (!isApiConfigured()) {
      setError("Backend API is not configured.");
      return;
    }
    loadTickets();
  }, []);

  const selectedTicketId = selectedTicket?.id;
  useEffect(() => {
    if (!selectedTicketId) return;
    let active = true;

    const pollMessages = async () => {
      try {
        const updated = await getSupportTicket(selectedTicketId);
        if (active) {
          setSelectedTicket(updated);
          setTickets((current) =>
            current.map((ticket) =>
              ticket.id === updated.id ? updated : ticket,
            ),
          );
        }
      } catch (err) {
        console.error("Failed to poll messages:", err);
      }
    };

    const interval = setInterval(pollMessages, 5000); // Poll every 5 seconds
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

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const created = await createSupportTicket(newTicket);
      setTickets((current) => [created, ...current]);
      setShowCreateModal(false);
      setNewTicket({
        subject: "",
        category: "general",
        priority: "medium",
        description: "",
      });
      setSelectedTicket(created);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create ticket");
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
      setTickets((current) =>
        current.map((ticket) => (ticket.id === updated.id ? updated : ticket)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setSendingMessage(false);
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

  const getStatusLabel = (status: SupportTicket["status"]) =>
    t(`supportTickets.${status}`);
  const getCategoryLabel = (category: SupportTicket["category"]) =>
    t(`supportTickets.${category}`);
  const visibleTickets =
    statusFilter === "all"
      ? tickets
      : tickets.filter((ticket) => ticket.status === statusFilter);
  const formatMessageDate = (value: string) =>
    formatApiDate(value, lang, {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="h-[calc(100dvh-170px)] min-h-[480px] grid grid-rows-[minmax(150px,0.38fr)_minmax(0,0.62fr)] lg:grid-rows-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-4">
      {/* Tickets List */}
      <div className="min-h-0 bg-white border border-line rounded-lg shadow-card flex flex-col">
        <div className="p-4 border-b border-line flex items-center justify-between">
          <h2 className="text-[15px] font-semibold">
            {t("supportTickets.title")}
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadTickets}
              disabled={loading}
              aria-label={t("supportTickets.refresh")}
              className="w-8 h-8 rounded-full border border-line text-muted flex items-center justify-center hover:bg-cream disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              aria-label={t("supportTickets.create")}
              className="w-8 h-8 rounded-full bg-blue text-white flex items-center justify-center hover:bg-blueDeep transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
        <div className="px-3 py-2 border-b border-line">
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as typeof statusFilter)
            }
            className="w-full text-[12px] border border-line rounded-lg px-2 py-2 outline-none focus:border-blue"
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
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-muted text-[13px]">
              {t("supportTickets.loading")}
            </div>
          ) : visibleTickets.length === 0 ? (
            <div className="p-4 text-center text-muted text-[13px]">
              {tickets.length
                ? t("supportTickets.noResults")
                : t("supportTickets.noTickets")}
            </div>
          ) : (
            visibleTickets.map((ticket) => (
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
                      {getCategoryLabel(ticket.category)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${getStatusColor(ticket.status)}`}
                  >
                    {getStatusLabel(ticket.status)}
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
          <div className="p-4 border-b border-line flex items-center justify-between">
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
                <span className="text-[11px] text-muted">
                  {getCategoryLabel(selectedTicket.category)}
                </span>
              </div>
            </div>
            <button
              onClick={() => setSelectedTicket(null)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-muted hover:bg-cream"
            >
              <X size={16} />
            </button>
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
            {selectedTicket.messages
              .filter((message) => !message.isInternal)
              .map((message) => (
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
                        ? t("supportTickets.support")
                        : t("supportTickets.you")}
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

          <form
            onSubmit={handleSendMessage}
            className="p-4 border-t border-line"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={t("supportTickets.messagePlaceholder")}
                aria-label={t("supportTickets.messagePlaceholder")}
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
                {messageFiles.map((file) => file.name).join("، ")}
              </div>
            )}
          </form>
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

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4">
          <div className="bg-white border border-line rounded-lg shadow-card w-full max-w-lg">
            <div className="flex items-center justify-between p-4 border-b border-line">
              <h3 className="text-[15px] font-semibold">
                {t("supportTickets.createTitle")}
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-muted hover:bg-cream"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCreateTicket} className="p-4 space-y-4">
              <div>
                <label className="block text-[12.5px] font-semibold text-ink70 mb-2">
                  {t("supportTickets.subject")} *
                </label>
                <input
                  type="text"
                  value={newTicket.subject}
                  onChange={(e) =>
                    setNewTicket({ ...newTicket, subject: e.target.value })
                  }
                  className="w-full border border-line rounded-lg px-3 py-2 text-[13.5px] outline-none focus:border-blue"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12.5px] font-semibold text-ink70 mb-2">
                    {t("supportTickets.category")}
                  </label>
                  <select
                    value={newTicket.category}
                    onChange={(e) =>
                      setNewTicket({
                        ...newTicket,
                        category: e.target
                          .value as CreateTicketInput["category"],
                      })
                    }
                    className="w-full border border-line rounded-lg px-3 py-2 text-[13.5px] outline-none focus:border-blue"
                  >
                    <option value="technical">
                      {t("supportTickets.technical")}
                    </option>
                    <option value="billing">
                      {t("supportTickets.billing")}
                    </option>
                    <option value="academic">
                      {t("supportTickets.academic")}
                    </option>
                    <option value="account">
                      {t("supportTickets.account")}
                    </option>
                    <option value="general">
                      {t("supportTickets.general")}
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12.5px] font-semibold text-ink70 mb-2">
                    {t("supportTickets.priority")}
                  </label>
                  <select
                    value={newTicket.priority}
                    onChange={(e) =>
                      setNewTicket({
                        ...newTicket,
                        priority: e.target
                          .value as CreateTicketInput["priority"],
                      })
                    }
                    className="w-full border border-line rounded-lg px-3 py-2 text-[13.5px] outline-none focus:border-blue"
                  >
                    <option value="low">{t("supportTickets.low")}</option>
                    <option value="medium">{t("supportTickets.medium")}</option>
                    <option value="high">{t("supportTickets.high")}</option>
                    <option value="urgent">{t("supportTickets.urgent")}</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[12.5px] font-semibold text-ink70 mb-2">
                  {t("supportTickets.description")} *
                </label>
                <textarea
                  value={newTicket.description}
                  onChange={(e) =>
                    setNewTicket({ ...newTicket, description: e.target.value })
                  }
                  className="w-full border border-line rounded-lg px-3 py-2 text-[13.5px] outline-none focus:border-blue h-24 resize-none"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg text-[13.5px] font-semibold border border-line text-ink70 hover:border-ink transition-colors"
                >
                  {t("supportTickets.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-lg text-[13.5px] font-semibold bg-blue text-white hover:bg-blueDeep transition-colors disabled:opacity-50"
                >
                  {loading
                    ? t("supportTickets.creating")
                    : t("supportTickets.createButton")}
                </button>
              </div>
            </form>
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
