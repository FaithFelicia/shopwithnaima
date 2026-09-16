import { NextResponse } from 'next/server';

/**
 * M-Pesa Daraja API — OAuth Token Generator
 *
 * This endpoint fetches a short-lived Bearer token from Safaricom Daraja.
 * The token is required for every subsequent Daraja API call (STK Push, query, etc.)
 *
 * REQUIRED ENV VARIABLES (add these to your .env file):
 *   MPESA_CONSUMER_KEY=<your Daraja consumer key>
 *   MPESA_CONSUMER_SECRET=<your Daraja consumer secret>
 *   MPESA_ENVIRONMENT=sandbox   ← change to "production" when going live
 *
 * Get credentials at: https://developer.safaricom.co.ke/
 */

export async function GET() {
  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
  const environment = process.env.MPESA_ENVIRONMENT || 'sandbox';

  // Guard: credentials must be set
  if (!consumerKey || !consumerSecret) {
    return NextResponse?.json(
      { error: 'M-Pesa credentials not configured. Set MPESA_CONSUMER_KEY and MPESA_CONSUMER_SECRET in .env' },
      { status: 500 }
    );
  }

  // Daraja base URLs
  const baseUrl =
    environment === 'production' ?'https://api.safaricom.co.ke'
      : 'https://sandbox.safaricom.co.ke';

  // Base64-encode "consumerKey:consumerSecret" for Basic Auth
  const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`)?.toString('base64');

  try {
    const response = await fetch(`${baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
      // Tokens expire in ~1 hour; no need to cache longer
      cache: 'no-store',
    });

    if (!response?.ok) {
      const errorText = await response?.text();
      console.error('[M-Pesa Token] Daraja error:', errorText);
      return NextResponse?.json(
        { error: 'Failed to fetch M-Pesa access token', details: errorText },
        { status: response?.status }
      );
    }

    const data = await response?.json();
    // data.access_token is the Bearer token
    return NextResponse?.json({ access_token: data?.access_token });
  } catch (err) {
    console.error('[M-Pesa Token] Network error:', err);
    return NextResponse?.json({ error: 'Network error contacting Daraja API' }, { status: 500 });
  }
}
