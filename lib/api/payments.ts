import { apiFetch } from "./client";

export type PaymentSettings = {
  cardNumber: string;
  accountNumber: string;
  cardHolderName: string;
  bankName: string;
  whatsappNumber: string;
};

export type PaymentRequest = {
  id: string;
  enrollmentId: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  paymentUrl?: string;
  paymentMethod?: "card-transfer" | "payment-link";
};

type ApiRecord = Record<string, unknown>;

function value(record: ApiRecord, ...keys: string[]): unknown {
  for (const key of keys) {
    if (record[key] !== undefined && record[key] !== null) return record[key];
  }
  return undefined;
}

function text(record: ApiRecord, ...keys: string[]): string {
  const result = value(record, ...keys);
  return result == null ? "" : String(result);
}

function numberValue(record: ApiRecord, ...keys: string[]): number {
  const result = Number(value(record, ...keys) ?? 0);
  return Number.isFinite(result) ? result : 0;
}

function normalizePayment(raw: unknown): PaymentRequest {
  const record = (raw ?? {}) as ApiRecord;
  return {
    id: text(record, "id", "Id", "paymentId", "PaymentId"),
    enrollmentId: text(record, "enrollmentId", "EnrollmentId"),
    amount: numberValue(record, "amount", "Amount"),
    currency: text(record, "currency", "Currency") || "IRR",
    status: text(record, "status", "Status") || "pending",
    createdAt: text(record, "createdAt", "CreatedAt"),
    paymentUrl:
      text(
        record,
        "paymentUrl",
        "PaymentUrl",
        "checkoutUrl",
        "CheckoutUrl",
        "redirectUrl",
        "RedirectUrl",
      ) || undefined,
    paymentMethod: (text(record, "paymentMethod", "PaymentMethod") ||
      undefined) as PaymentRequest["paymentMethod"] | undefined,
  };
}

/** GET /api/payment/settings — public payment instructions, card number masked by backend. */
export async function getPaymentSettings(): Promise<PaymentSettings> {
  const record = (await apiFetch<unknown>(
    "/api/payment/settings",
  )) as ApiRecord;
  return {
    cardNumber: text(record, "cardNumber", "CardNumber"),
    accountNumber: text(record, "accountNumber", "AccountNumber"),
    cardHolderName: text(record, "cardHolderName", "CardHolderName"),
    bankName: text(record, "bankName", "BankName"),
    whatsappNumber: text(
      record,
      "whatsappNumber",
      "WhatsappNumber",
      "WhatsAppNumber",
    ),
  };
}

/** POST /api/payments — create/reuse the payment request for a pending enrollment. */
export async function createPaymentRequest(
  enrollmentId: string,
  paymentMethod: PaymentRequest["paymentMethod"] = "card-transfer",
): Promise<PaymentRequest> {
  const data = await apiFetch<unknown>("/api/payments", {
    method: "POST",
    body: { enrollmentId, paymentMethod },
  });
  return normalizePayment(data);
}

/** POST /api/payments/{paymentId}/receipt — submit the receipt for admin verification. */
export async function uploadPaymentReceipt(
  paymentId: string,
  receipt: File,
): Promise<PaymentRequest> {
  const formData = new FormData();
  formData.append("receipt", receipt);
  const data = await apiFetch<unknown>(
    `/api/payments/${encodeURIComponent(paymentId)}/receipt`,
    { method: "POST", body: formData },
  );
  return normalizePayment(data);
}
