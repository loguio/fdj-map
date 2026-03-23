import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const latitude = searchParams.get('latitude');
  const longitude = searchParams.get('longitude');

  if (!latitude || !longitude) {
    return NextResponse.json(
      { error: 'Latitude and longitude are required' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `https://fdj-points-de-vente.r1a.eu/api/stores?latitude=${latitude}&longitude=${longitude}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; FDJMap/1.0)',
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`FDJ API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying FDJ API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch FDJ data' },
      { status: 500 }
    );
  }
}
