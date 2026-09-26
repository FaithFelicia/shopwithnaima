import { NextResponse } from 'next/server';

// Never expose Daraja access tokens to public browser clients.
export async function GET() {
  return NextResponse.json(
    { error: 'This endpoint is disabled. M-Pesa credentials are used only by server-side payment routes.' },
    { status: 410 }
  );
}
