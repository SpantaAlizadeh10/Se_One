import { apiFetch } from "./client";

/**
 * ---------------------------------------------------------------------
 * Payment processing — NOT wired to a real payment gateway. Before a
 * real launch you need an actual processor (Stripe, PayPal, a local
 * Iranian gateway like ZarinPal, etc.) — this file exists so the
 * checkout UI has one clear place to plug that in.
 *
 * The typical real integration looks like:
 *   1. Call your backend to create a payment intent/session:
 *        POST /api/payments/create-intent { courseId } -> { clientSecret }
 *   2. Hand that clientSecret to the payment provider's SDK
 *      (e.g. Stripe.js) to actually collect and charge the card —
 *      raw card numbers should NEVER be sent to your own backend
 *      directly, only to the payment provider's SDK/servers.
 *   3. Your backend confirms the charge via a webhook, then marks the
 *      enrollment as paid.
 *
 * `mockCharge` below fakes step 2+3 entirely client-side (a timeout,
 * then success) so the checkout flow can be built and tested end to
 * end before a real processor is wired in. Swap the body of this
 * function, not its signature, when you're ready.
 * ---------------------------------------------------------------------
 */

export type ChargeInput = {
  courseId: string;
  amount: number;
  cardholderName: string;
};

export type ChargeResult = {
  success: boolean;
  enrollmentId: string;
};

export async function mockCharge(input: ChargeInput): Promise<ChargeResult> {
  await new Promise((resolve) => setTimeout(resolve, 1200));
  return { success: true, enrollmentId: `enr-${Date.now()}` };
}

/**
 * Once a real backend + payment provider exist, replace mockCharge's
 * usage in the checkout page with something like:
 *
 * export async function createPaymentIntent(courseId: string) {
 *   return apiFetch<{ clientSecret: string }>("/api/payments/create-intent", {
 *     method: "POST",
 *     body: { courseId }
 *   });
 * }
 */
