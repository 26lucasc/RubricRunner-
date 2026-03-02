import { NextRequest, NextResponse } from "next/server";

/**
 * Proxies requests to Google Time Zone API.
 * Requires lat, lng query params. Keeps API key server-side.
 * @see https://developers.google.com/maps/documentation/timezone
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (!lat || !lng) {
    return NextResponse.json(
      { error: "lat and lng query params required" },
      { status: 400 }
    );
  }

  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "Google Maps API key not configured" },
      { status: 500 }
    );
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const url = `https://maps.googleapis.com/maps/api/timezone/json?location=${encodeURIComponent(lat)},${encodeURIComponent(lng)}&timestamp=${timestamp}&key=${key}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== "OK") {
      return NextResponse.json(
        { error: data.errorMessage ?? "Time zone lookup failed" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      timeZoneId: data.timeZoneId,
      timeZoneName: data.timeZoneName,
      rawOffset: data.rawOffset,
      dstOffset: data.dstOffset,
    });
  } catch (err) {
    console.error("Time Zone API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch time zone" },
      { status: 500 }
    );
  }
}
