import { NextRequest, NextResponse } from 'next/server';

/**
 * M-Pesa Daraja API — STK Push Callback
 *
 * Safaricom calls this URL after the customer approves or rejects the payment.
 * You can use this to update your order status in Supabase.
 *
 * REQUIRED ENV VARIABLE:
 *   MPESA_CALLBACK_URL=https://shopwithna1843.builtwithrocket.new/api/payments/mpesa/callback
 *
 * NOTE: This URL must be publicly accessible (not localhost).
 *       The URL above is already set to your live domain.
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Daraja wraps the result in Body.stkCallback
    const callback = body?.Body?.stkCallback;

    if (!callback) {
      console.warn('[M-Pesa Callback] Unexpected payload shape:', body);
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }

    const {
      MerchantRequestID,
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
      CallbackMetadata,
    } = callback;

    if (ResultCode === 0) {
      // ── Payment SUCCESSFUL ────────────────────────────────────────────────
      // Extract metadata items (Amount, MpesaReceiptNumber, PhoneNumber, etc.)
      const items: Record<string, string | number> = {};
      if (CallbackMetadata?.Item) {
        for (const item of CallbackMetadata.Item) {
          if (item.Name && item.Value !== undefined) {
            items[item.Name] = item.Value;
          }
        }
      }

      console.log('[M-Pesa Callback] Payment successful:', {
        MerchantRequestID,
        CheckoutRequestID,
        Amount: items['Amount'],
        MpesaReceiptNumber: items['MpesaReceiptNumber'],
        PhoneNumber: items['PhoneNumber'],
      });

      // TODO: Update your Supabase order status here
      // Example:
      // const supabase = createClient();
      // await supabase
      //   .from('orders')
      //   .update({ status: 'paid', mpesa_receipt: items['MpesaReceiptNumber'] })
      //   .eq('checkout_request_id', CheckoutRequestID);

    } else {
      // ── Payment FAILED or CANCELLED ───────────────────────────────────────
      console.warn('[M-Pesa Callback] Payment failed:', { ResultCode, ResultDesc, CheckoutRequestID });

      // TODO: Update your Supabase order status to 'failed' or 'cancelled'
    }

    // Always respond with 200 + ResultCode 0 so Daraja doesn't retry
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (err) {
    console.error('[M-Pesa Callback] Error processing callback:', err);
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  }
}
