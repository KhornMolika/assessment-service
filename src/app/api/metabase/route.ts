import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

export async function GET() {
  const METABASE_SITE_URL = process.env.METABASE_SITE_URL || 'https://metabase.molika.app';
  const METABASE_SECRET_KEY = process.env.METABASE_SECRET_KEY || '9b375d8beaa0dad86604e5a7e8393ea2f2a7f826b70bc9ab9f84476bf026f43d';
  // Hardcode to Dashboard 2 as we configured the API for it
  const METABASE_DASHBOARD_ID = 2;

  if (!METABASE_SITE_URL || !METABASE_SECRET_KEY) {
    return NextResponse.json(
      { error: 'Metabase is not configured' },
      { status: 501 } // Not Implemented
    );
  }

  try {
    const payload = {
      resource: { dashboard: METABASE_DASHBOARD_ID },
      params: {
        client_id: process.env.API_CLIENT_ID
      },
      exp: Math.round(Date.now() / 1000) + (10 * 60) // 10 minute expiration
    };

    const token = jwt.sign(payload, METABASE_SECRET_KEY);
    const iframeUrl = `${METABASE_SITE_URL}/embed/dashboard/${token}#bordered=true&titled=true`;

    return NextResponse.json({ url: iframeUrl });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Failed to generate Metabase token:', error);
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    );
  }
}
