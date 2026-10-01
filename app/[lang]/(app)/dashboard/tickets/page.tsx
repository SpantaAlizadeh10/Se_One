"use client";

import { useEffect, useState } from "react";
import { Plus, Send, X, Clock, MessageSquare, CheckCircle, AlertCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { isApiConfigured } from "@/lib/is-api-configured";
import {
  getSupportTickets,
  createSupportTicket,
  getSupportTicket,
  addSupportMessage,
  type SupportTicket,
  type SupportMessage,
  type CreateTicketInput,
} from "@/lib/api/support";

export default function StudentTicketsPage() {
  const { t, href } = useLanguage();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

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

  useEffect(() => {
    if (!selectedTicket) return;

    const pollMessages = async () => {
      try {
        const updated = await getSupportTicket(selectedTicket.id);
        setSelectedTicket(updated);
      } catch (err) {
        console.error("Failed to poll messages:", err);
      }
    };

    const interval = setInterval(pollMessages, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [selectedTicket]);

  const loadTickets = async () => {
    setLoading(true);
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
      setTickets([created, ...tickets]);
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
    if (!newMessage.trim() || !selectedTicket) return;

    setSendingMessage(true);
    try {
      await addSupportMessage(selectedTicket.id, { content: newMessage });
      setNewMessage("");
      const updated = await getSupportTicket(selectedTicket.id);
      setSelectedTicket(updated);
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

  return (
    <div className="h-[calc(100vh-120px)] flex gap-4">
      {/* Tickets List */}
      <div className="w-80 bg-white border border-line rounded-lg shadow-card flex flex-col">
        <div className="p-4 border-b border-line flex items-center justify-between">
          <h2 className="text-[15px] font-semibold">Support Tickets</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-8 h-8 rounded-full bg-blue text-white flex items-center justify-center hover:bg-blueDeep transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-muted text-[13px]">Loading...</div>
          ) : tickets.length === 0 ? (
            <div className="p-4 text-center text-muted text-[13px]">No tickets yet</div>
          ) : (
            tickets.map((ticket) => (
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
                    <div className="text-[13.5px] font-semibold truncate">{ticket.subject}</div>
                    <div className="text-[11px] text-muted capitalize">{ticket.category}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${getStatusColor(ticket.status)}`}>
                    {ticket.status.replace("_", " ")}
                  </span>
                  {ticket.messages.length > 0 && (
                    <span className="text-[11px] text-muted">{ticket.messages.length} messages</span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat View */}
      {selectedTicket ? (
        <div className="flex-1 bg-white border border-line rounded-lg shadow-card flex flex-col">
          <div className="p-4 border-b border-line flex items-center justify-between">
            <div>
              <h3 className="text-[15px] font-semibold">{selectedTicket.subject}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${getStatusColor(selectedTicket.status)}`}>
                  {selectedTicket.status.replace("_", " ")}
                </span>
                <span className="text-[11px] text-muted capitalize">{selectedTicket.category}</span>
              </div>
            </div>
            <button
              onClick={() => setSelectedTicket(null)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-muted hover:bg-cream"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                    {message.isFromSupport ? "Support" : "You"}
                  </div>
                  <div className="text-[13px]">{message.content}</div>
                  <div className="text-[10.5px] opacity-70 mt-1">
                    {new Date(message.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="p-4 border-t border-line">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 border border-line rounded-lg px-3 py-2 text-[13.5px] outline-none focus:border-blue"
                disabled={sendingMessage}
              />
              <button
                type="submit"
                disabled={sendingMessage || !newMessage.trim()}
                className="w-10 h-10 rounded-lg bg-blue text-white flex items-center justify-center hover:bg-blueDeep transition-colors disabled:opacity-50"
              >
                <Send size={16} />
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="flex-1 bg-white border border-line rounded-lg shadow-card flex items-center justify-center">
          <div className="text-center">
            <MessageSquare size={48} className="text-muted mx-auto mb-4" />
            <h3 className="text-[15px] font-semibold mb-2">Select a ticket</h3>
            <p className="text-muted text-[13px]">Choose a ticket from the list or create a new one</p>
          </div>
        </div>
      )}

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4">
          <div className="bg-white border border-line rounded-lg shadow-card w-full max-w-lg">
            <div className="flex items-center justify-between p-4 border-b border-line">
              <h3 className="text-[15px] font-semibold">Create New Ticket</h3>
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
                  Subject *
                </label>
                <input
                  type="text"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  className="w-full border border-line rounded-lg px-3 py-2 text-[13.5px] outline-none focus:border-blue"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12.5px] font-semibold text-ink70 mb-2">
                    Category
                  </label>
                  <select
                    value={newTicket.category}
                    onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value as any })}
                    className="w-full border border-line rounded-lg px-3 py-2 text-[13.5px] outline-none focus:border-blue"
                  >
                    <option value="technical">Technical</option>
                    <option value="billing">Billing</option>
                    <option value="academic">Academic</option>
                    <option value="account">Account</option>
                    <option value="general">General</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12.5px] font-semibold text-ink70 mb-2">
                    Priority
                  </label>
                  <select
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value as any })}
                    className="w-full border border-line rounded-lg px-3 py-2 text-[13.5px] outline-none focus:border-blue"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[12.5px] font-semibold text-ink70 mb-2">
                  Description *
                </label>
                <textarea
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
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
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-lg text-[13.5px] font-semibold bg-blue text-white hover:bg-blueDeep transition-colors disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create Ticket"}
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
