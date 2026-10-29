
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const latitude = searchParams.get("latitude");
  const longitude = searchParams.get("longitude");

  if (!latitude || !longitude) {
    return NextResponse.json(
      { error: "Latitude and longitude are required." },
      { status: 400 }
    );
  }

  const lat = Number(latitude);
  const lon = Number(longitude);

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lon) ||
    lat < -90 ||
    lat > 90 ||
    lon < -180 ||
    lon > 180
  ) {
    return NextResponse.json(
      { error: "Invalid latitude or longitude." },
      { status: 400 }
    );
  }

  try {
    const apiUrl = new URL(
      "https://api.open-meteo.com/v1/forecast"
    );

    apiUrl.searchParams.set("latitude", String(lat));
    apiUrl.searchParams.set("longitude", String(lon));
    apiUrl.searchParams.set(
      "current",
      "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m"
    );
    apiUrl.searchParams.set(
      "daily",
      "temperature_2m_max,temperature_2m_min,weather_code,uv_index_max"
    );
    apiUrl.searchParams.set("hourly", "temperature_2m");
    apiUrl.searchParams.set("timezone", "Asia/Kolkata");

    const response = await fetch(apiUrl.toString(), {
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Unable to retrieve weather data." },
        { status: 502 }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Weather service is temporarily unavailable." },
      { status: 500 }
    );
  }
}
