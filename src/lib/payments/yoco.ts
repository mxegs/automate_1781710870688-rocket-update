/**
 * Yoco payment integration stub.
 * Wire YOCO_SECRET_KEY in .env when ready for Checkout API.
 * Docs: https://developer.yoco.com/docs/checkout-api/
 *
 * Quick option: paste your Yoco Payment Page link per event
 * (https://pay.yoco.com/your-page?amount=200.00&reference=...)
 */

export interface YocoPaymentParams {
  eventId: string;
  rsvpId: string;
  amountCents: number;
  currency: string;
  description: string;
  existingLink?: string | null;
  successUrl?: string;
}

export function buildYocoPaymentUrl(params: YocoPaymentParams): string {
  if (params.existingLink) {
    const url = new URL(params.existingLink);
    if (!url.searchParams.has('amount')) {
      url.searchParams.set('amount', (params.amountCents / 100).toFixed(2));
    }
    url.searchParams.set('reference', params.rsvpId);
    if (params.successUrl) {
      url.searchParams.set('redirectOnPaymentSuccess', params.successUrl);
    }
    return url.toString();
  }

  // Fallback when no payment page link — replace with Checkout API in production
  const base = process.env.YOCO_PAYMENT_PAGE_URL ?? 'https://pay.yoco.com';
  const url = new URL(base);
  url.searchParams.set('amount', (params.amountCents / 100).toFixed(2));
  url.searchParams.set('currency', params.currency);
  url.searchParams.set('reference', params.rsvpId);
  url.searchParams.set('description', params.description);
  return url.toString();
}

export async function createYocoCheckout(params: YocoPaymentParams): Promise<string | null> {
  const secretKey = process.env.YOCO_SECRET_KEY;
  if (!secretKey) return null;

  const res = await fetch('https://payments.yoco.com/api/checkouts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: params.amountCents,
      currency: params.currency,
      successUrl: params.successUrl ?? `${process.env.NEXT_PUBLIC_APP_URL}/member/events/${params.eventId}`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/member/events/${params.eventId}`,
      metadata: { eventId: params.eventId, rsvpId: params.rsvpId },
    }),
  });

  if (!res.ok) return null;
  const data = (await res.json()) as { redirectUrl?: string };
  return data.redirectUrl ?? null;
}

export async function confirmYocoPayment(
  rsvpId: string,
  ticketCode: string,
): Promise<{ success: boolean }> {
  console.info('[Yoco] Payment confirmed for RSVP', rsvpId, ticketCode);
  return { success: true };
}
