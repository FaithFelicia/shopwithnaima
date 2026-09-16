import { NextRequest, NextResponse } from 'next/server';

/**
 * M-Pesa Daraja API — STK Push (Lipa Na M-Pesa Online)
 *
 * This endpoint initiates an STK Push request to the customer's phone.
 * The customer receives a PIN prompt on their phone and approves the payment.
 *
 * REQUIRED ENV VARIABLES (add these to your .env file):
 *   MPESA_CONSUMER_KEY=<your Daraja consumer key>
 *   MPESA_CONSUMER_SECRET=<your Daraja consumer secret>
 *   MPESA_SHORTCODE=174379                  ← sandbox default; use your real Till/Paybill in production
 *   MPESA_PASSKEY=<your Daraja passkey>     ← from Daraja portal (sandbox has a default passkey)
 *   MPESA_CALLBACK_URL=https://shopwithna1843.builtwithrocket.new/api/payments/mpesa/callback
 *   MPESA_ENVIRONMENT=sandbox               ← change to "production" when going live
 *
 * RECEIVING NUMBER: 0758733214 (Shop With Naima)
 * This is set as MPESA_SHORTCODE in production. For C2B (customer-to-business) the shortcode
 * is your registered Safaricom Till Number or Paybill Number.
 *
 * Get credentials at: https://developer.safaricom.co.ke/
 */

// Helper: format phone to 254XXXXXXXXX (Daraja requires this format)
function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\s+/g, '').replace(/^\+/, '');
  if (cleaned.startsWith('0')) return `254${cleaned.slice(1)}`;
  if (cleaned.startsWith('254')) return cleaned;
  return `254${cleaned}`;
}

// Helper: generate Daraja timestamp (YYYYMMDDHHmmss)
function getTimestamp(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    now.getFullYear().toString() +
    pad(now.getMonth() + 1) +
    pad(now.getDate()) +
    pad(now.getHours()) +
    pad(now.getMinutes()) +
    pad(now.getSeconds())
  );
}

// Helper: generate Daraja password (Base64 of shortcode + passkey + timestamp)
function generatePassword(shortcode: string, passkey: string, timestamp: string): string {
  return Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');
}

// Helper: fetch OAuth token from Daraja
async function getDarajaToken(baseUrl: string): Promise<string> {
  const consumerKey = process.env.MPESA_CONSUMER_KEY!;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET!;
  const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

  const res = await fetch(`${baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
    method: 'GET',
    headers: { Authorization: `Basic ${credentials}` },
    cache: 'no-store',
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token fetch failed: ${err}`);
  }

  const data = await res.json();
  return data.access_token as string;
}

export async function POST(req: NextRequest) {
  // ── Read environment variables ──────────────────────────────────────────────
  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
  // In production: set MPESA_SHORTCODE to your registered Till/Paybill (e.g. 0758733214 → registered shortcode)
  const shortcode = process.env.MPESA_SHORTCODE || '174379'; // 174379 = Daraja sandbox default
  const passkey = process.env.MPESA_PASSKEY || 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919'; // sandbox default
  const callbackUrl =
    process.env.MPESA_CALLBACK_URL ||
    'https://shopwithna1843.builtwithrocket.new/api/payments/mpesa/callback';
  const environment = process.env.MPESA_ENVIRONMENT || 'sandbox';

  // Guard: credentials must be set for production
  if (!consumerKey || !consumerSecret) {
    return NextResponse.json(
      {
        error: 'M-Pesa credentials not configured.',
        hint: 'Add MPESA_CONSUMER_KEY and MPESA_CONSUMER_SECRET to your .env file.',
      },
      { status: 500 }
    );
  }

  // ── Parse request body ──────────────────────────────────────────────────────
  let body: { phone?: string; amount?: number; orderId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { phone, amount, orderId } = body;

  if (!phone || !amount) {
    return NextResponse.json({ error: 'phone and amount are required' }, { status: 400 });
  }

  const formattedPhone = formatPhone(phone);
  // Daraja requires amount as integer (no decimals)
  const stkAmount = Math.ceil(amount);

  // ── Daraja base URL ─────────────────────────────────────────────────────────
  const baseUrl =
    environment === 'production' ?'https://api.safaricom.co.ke'
      : 'https://sandbox.safaricom.co.ke';

  try {
    // Step 1: Get OAuth token
    const accessToken = await getDarajaToken(baseUrl);

    // Step 2: Build STK Push payload
    const timestamp = getTimestamp();
    const password = generatePassword(shortcode, passkey, timestamp);

    const stkPayload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerBuyGoodsOnline', // Use "CustomerPayBillOnline" for Paybill
      Amount: stkAmount,
      PartyA: formattedPhone,       // Customer phone (paying)
      PartyB: shortcode,            // Your Till/Paybill number
      PhoneNumber: formattedPhone,  // Phone to receive STK prompt
      CallBackURL: callbackUrl,
      AccountReference: orderId || 'ShopWithNaima',
      TransactionDesc: `Payment for order ${orderId || 'ShopWithNaima'}`,
    };

    // Step 3: Send STK Push request to Daraja
    const stkRes = await fetch(`${baseUrl}/mpesa/stkpush/v1/processrequest`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(stkPayload),
    });

    const stkData = await stkRes.json();

    if (!stkRes.ok || stkData.ResponseCode !== '0') {
      console.error('[M-Pesa STK Push] Daraja error:', stkData);
      return NextResponse.json(
        {
          error: 'STK Push failed',
          details: stkData.errorMessage || stkData.ResponseDescription || 'Unknown error',
          raw: stkData,
        },
        { status: stkRes.status || 400 }
      );
    }

    // Step 4: Return success — CheckoutID is used to query payment status
    return NextResponse.json({
      success: true,
      checkoutRequestId: stkData.CheckoutRequestID,
      merchantRequestId: stkData.MerchantRequestID,
      responseDescription: stkData.ResponseDescription,
      customerMessage: stkData.CustomerMessage,
    });
  } catch (err) {
    console.error('[M-Pesa STK Push] Error:', err);
    return NextResponse.json(
      { error: 'Failed to initiate M-Pesa payment', details: String(err) },
      { status: 500 }
    );
  }
}
