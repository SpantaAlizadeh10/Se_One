"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, RefreshCw, Wallet, X } from "lucide-react";
import {
  listAdminWithdrawals,
  setAdminWithdrawalStatus,
  type AdminWithdrawalRequest,
  type AdminWithdrawalStatus,
} from "@/lib/api/admin";
import { isApiConfigured } from "@/lib/is-api-configured";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import AdminDataSourceBanner from "@/components/admin/AdminDataSourceBanner";

type StatusFilter = "pending" | "all" | "approved" | "rejected";

export default function AdminWithdrawalsPage() {
  const { t, lang } = useLanguage();
  const d = t("adminWithdrawalsPage");
  const [requests, setRequests] = useState<AdminWithdrawalRequest[]>([]);
  const [filter, setFilter] = useState<StatusFilter>("pending");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadRequests = useCallback(async () => {
    if (!isApiConfigured()) {
      setError(d.apiUnavailable);
      setRequests([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await listAdminWithdrawals({
        page: 1,
        pageSize: 100,
        ...(filter === "all" ? {} : { status: filter }),
      });
      setRequests(result.items);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : d.loadFailed);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [d.apiUnavailable, d.loadFailed, filter]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const updateStatus = async (
    request: AdminWithdrawalRequest,
    status: Exclude<AdminWithdrawalStatus, "pending">,
  ) => {
    const confirmText =
      status === "approved" ? d.confirmApprove : d.confirmReject;
    if (!window.confirm(confirmText)) return;
    setUpdatingId(request.id);
    setError(null);
    try {
      await setAdminWithdrawalStatus(request.id, status);
      setRequests((current) =>
        filter === "all"
          ? current.map((item) =>
              item.id === request.id ? { ...item, status } : item,
            )
          : current.filter((item) => item.id !== request.id),
      );
    } catch (updateError) {
      setError(
        updateError instanceof Error ? updateError.message : d.updateFailed,
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const formatMoney = (amount: number, currency: string) =>
    `${new Intl.NumberFormat(lang === "fa" ? "fa-IR" : "en-US").format(amount)} ${currency}`;
  const formatDate = (date: string) => {
    if (!date) return d.dateUnknown;
    const parsed = new Date(date);
    return Number.isNaN(parsed.getTime())
      ? date
      : parsed.toLocaleString(lang === "fa" ? "fa-IR" : "en-US");
  };

  const filters: { id: StatusFilter; label: string }[] = [
    { id: "pending", label: d.pending },
    { id: "all", label: d.all },
    { id: "approved", label: d.approved },
    { id: "rejected", label: d.rejected },
  ];

  return (
    <div>
      <AdminDataSourceBanner apiError={error} onRetry={loadRequests} />
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="mb-1 font-serif text-[24px] font-semibold sm:text-[27px]">
            {d.title}
          </h2>
          <p className="m-0 text-[13px] text-muted">{d.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={loadRequests}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-3.5 py-2.5 text-[13px] font-semibold text-ink70 hover:border-ink disabled:opacity-50"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          {d.refresh}
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {filters.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={`rounded-full px-3.5 py-2 text-[12px] font-semibold transition-colors ${filter === item.id ? "bg-ink text-white" : "border border-line bg-white text-ink70 hover:bg-cream"}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="rounded-xl border border-line bg-white p-8 text-center text-[13px] text-muted">
          {d.loading}
        </div>
      ) : requests.length === 0 ? (
        <div className="rounded-xl border border-line bg-white p-10 text-center shadow-card">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-goldSoft text-goldDeep">
            <Wallet size={22} />
          </div>
          <p className="m-0 text-[14px] font-semibold">{d.emptyTitle}</p>
          <p className="mb-0 mt-1 text-[12px] text-muted">{d.emptySubtitle}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((request) => (
            <article
              key={request.id}
              className="rounded-xl border border-line bg-white p-4 shadow-card sm:p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="m-0 text-[15px] font-semibold">
                      {request.teacherName || d.teacherFallback}
                    </h3>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10.5px] font-bold ${request.status === "pending" ? "bg-[#FFF1D6] text-[#B8792E]" : request.status === "approved" ? "bg-sage text-sageDeep" : "bg-danger/10 text-danger"}`}
                    >
                      {d[request.status]}
                    </span>
                  </div>
                  {request.teacherEmail && (
                    <p className="mb-0 mt-1 text-[12px] text-muted" dir="ltr">
                      {request.teacherEmail}
                    </p>
                  )}
                </div>
                <div className="text-start sm:text-end">
                  <div className="text-[18px] font-bold">
                    {formatMoney(request.amount, request.currency)}
                  </div>
                  <div className="mt-1 text-[11px] text-muted">
                    {d.requestedAt}: {formatDate(request.requestedAt)}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
                <div className="text-[12px] text-ink70">
                  <span className="text-muted">{d.iban}: </span>
                  <span dir="ltr" className="font-medium">
                    {request.iban || "—"}
                  </span>
                </div>
                {request.status === "pending" && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => updateStatus(request, "rejected")}
                      disabled={updatingId === request.id}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-danger/30 px-3 py-2 text-[12px] font-semibold text-danger hover:bg-danger/10 disabled:opacity-50"
                    >
                      <X size={14} />
                      {d.reject}
                    </button>
                    <button
                      type="button"
                      onClick={() => updateStatus(request, "approved")}
                      disabled={updatingId === request.id}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-sage px-3 py-2 text-[12px] font-semibold text-sageDeep hover:bg-sage/80 disabled:opacity-50"
                    >
                      <Check size={14} />
                      {updatingId === request.id ? d.updating : d.approve}
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
