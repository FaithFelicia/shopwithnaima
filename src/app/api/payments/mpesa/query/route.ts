import { NextRequest, NextResponse } from 'next/server';

/**
 * M-Pesa Daraja API — STK Push Query (Payment Status Check)
 *
 * Use this to poll whether a specific STK Push was completed.
 * Call with the CheckoutRequestID returned from the STK Push endpoint.
 *
 * REQUIRED ENV VARIABLES:
 *   MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, MPESA_SHORTCODE, MPESA_PASSKEY
 */

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

async function getDarajaToken(baseUrl: string): Promise<string> {
  const credentials = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString('base64');
  const res = await fetch(`${baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
    method: 'GET',
    headers: { Authorization: `Basic ${credentials}` },
    cache: 'no-store',
  });
  const data = await res.json();
  return data.access_token as string;
}

export async function POST(req: NextRequest) {
  const shortcode = process.env.MPESA_SHORTCODE || '174379';
  const passkey = process.env.MPESA_PASSKEY || 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';
  const environment = process.env.MPESA_ENVIRONMENT || 'sandbox';
  const baseUrl =
    environment === 'production' ?'https://api.safaricom.co.ke'
      : 'https://sandbox.safaricom.co.ke';

  let body: { checkoutRequestId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { checkoutRequestId } = body;
  if (!checkoutRequestId) {
    return NextResponse.json({ error: 'checkoutRequestId is required' }, { status: 400 });
  }

  try {
    const accessToken = await getDarajaToken(baseUrl);
    const timestamp = getTimestamp();
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');

    const queryRes = await fetch(`${baseUrl}/mpesa/stkpushquery/v1/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId,
      }),
    });

    const queryData = await queryRes.json();

    // ResultCode 0 = success, 1032 = cancelled, 1037 = timeout
    return NextResponse.json({
      resultCode: queryData.ResultCode,
      resultDesc: queryData.ResultDesc,
      paid: queryData.ResultCode === '0' || queryData.ResultCode === 0,
    });
  } catch (err) {
    console.error('[M-Pesa Query] Error:', err);
    return NextResponse.json({ error: 'Failed to query payment status' }, { status: 500 });
  }
}
