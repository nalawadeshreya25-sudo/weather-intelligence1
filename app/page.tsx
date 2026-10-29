
"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

type WeatherData = {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    apparent_temperature: number;
    weather_code: number;
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weather_code: number[];
    uv_index_max: number[];
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
  };
};

type PredictionData = {
  predicted_temperature: number;
  mean_absolute_error: number;
  model_type: string;
  data_type: string;
};

type AirQualityData = {
  current: {
    us_aqi: number;
    pm2_5: number;
    pm10: number;
  };
};

const cities = [
  { name: "Pune", latitude: 18.5204, longitude: 73.8567 },
  { name: "Mumbai", latitude: 19.076, longitude: 72.8777 },
  { name: "Nashik", latitude: 19.9975, longitude: 73.7898 },
  { name: "Nagpur", latitude: 21.1458, longitude: 79.0882 },
  { name: "Kolhapur", latitude: 16.705, longitude: 74.2433 },
  { name: "Solapur", latitude: 17.6599, longitude: 75.9064 },
  { name: "Satara", latitude: 17.6805, longitude: 74.0183 },
  { name: "Amravati", latitude: 20.9374, longitude: 77.7796 },
  { name: "Nanded", latitude: 19.1383, longitude: 77.321 },
  { name: "Ratnagiri", latitude: 16.9902, longitude: 73.312 },
  { name: "Thane", latitude: 19.2183, longitude: 72.9781 },
  { name: "Jalgaon", latitude: 21.0077, longitude: 75.5626 },
];

function getWeatherCondition(code: number) {
  if (code === 0) return "Clear Sky";
  if ([1, 2, 3].includes(code)) return "Partly Cloudy";
  if ([45, 48].includes(code)) return "Foggy";
  if ([51, 53, 55, 61, 63, 65].includes(code)) return "Rainy";
  if ([71, 73, 75, 77].includes(code)) return "Snowy";
  if ([80, 81, 82].includes(code)) return "Rain Showers";
  if ([95, 96, 99].includes(code)) return "Thunderstorm";
  return "Mixed Conditions";
}

export default function Home() {
  const [city, setCity] = useState("Pune");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [airQuality, setAirQuality] = useState<AirQualityData | null>(null);
  const [prediction, setPrediction] = useState<PredictionData | null>(null);

  useEffect(() => {
    async function getWeather() {
      setLoading(true);
      setError("");
      setWeather(null);

      try {
        const selectedCity = cities.find((item) => item.name === city);

        if (!selectedCity) {
          throw new Error("City not found");
        }
        
          const url = `/api/weather?latitude=${selectedCity.latitude}&longitude=${selectedCity.longitude}`;
          const response = await fetch(url);    

        if (!response.ok) {
          throw new Error("Weather data not found");
        }

        const data: WeatherData = await response.json();
        setWeather(data);
        const airQualityUrl =
  `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${selectedCity.latitude}` +
  `&longitude=${selectedCity.longitude}&current=us_aqi,pm2_5,pm10&timezone=Asia%2FKolkata`;

const airQualityResponse = await fetch(airQualityUrl);

if (!airQualityResponse.ok) {
  throw new Error("Air quality data not found");
}

const airQualityData: AirQualityData =
  await airQualityResponse.json();

setAirQuality(airQualityData);

        const predictionResponse = await fetch("/api/prediction");

        if (predictionResponse.ok) {
          const predictionData: PredictionData =
            await predictionResponse.json();

          setPrediction(predictionData);
        }


      } catch {
        setError("Weather data could not be loaded. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    getWeather();
  }, [city]);

  const hourlyForecast =
    weather?.hourly.time
      .map((time, index) => ({
        time,
        temperature: weather.hourly.temperature_2m[index],
      }))
      .filter(({ time }) => {
        const forecastTime = new Date(time.replace(" ", "T") + "+05:30");
        return forecastTime >= new Date();
      })
      .slice(0, 12) ?? [];

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <p className="mb-3 text-sm font-semibold tracking-widest text-cyan-400">
          XENVOLT · WEATHER INTELLIGENCE
        </p>

        <h1 className="text-3xl font-bold md:text-5xl">
          Maharashtra Weather
        </h1>

        <p className="mt-3 text-slate-300">
          Check current weather and forecasts across Maharashtra.
        </p>

        <label htmlFor="city" className="mt-8 block font-semibold">
          Select your city
        </label>

        <select
          id="city"
          value={city}
          onChange={(event) => setCity(event.target.value)}
          className="mt-3 w-full rounded-xl border border-slate-700 bg-slate-900 p-4 text-white"
        >
          {cities.map((item) => (
            <option key={item.name} value={item.name}>
              {item.name}
            </option>
          ))}
        </select>

        <section className="mt-6 rounded-3xl border border-slate-700 bg-slate-900 p-6 md:p-8">
          <p className="text-slate-400">Current weather in</p>
          <h2 className="mt-1 text-2xl font-bold">📍 {city}</h2>

          {loading && (
            <p className="mt-6 text-cyan-300">Loading weather data...</p>
          )}

          {error && (
            <p className="mt-6 text-red-400">{error}</p>
          )}

          {weather && !loading && (
            <>
              <div className="mt-6">
                <p className="text-6xl font-bold text-cyan-300">
                  {weather.current.temperature_2m}°C
                </p>
                <p className="mt-3 text-slate-300">
                  Feels like {weather.current.apparent_temperature}°C
                </p>
                <p className="mt-2 text-lg text-slate-300">
                  {getWeatherCondition(weather.current.weather_code)}
                </p>
              </div>

              <div className="mt-6 rounded-2xl border border-cyan-900 bg-cyan-950/40 p-5">
                <h3 className="text-xl font-bold text-cyan-300">
                  
              {prediction && (
                <div className="mt-6 rounded-2xl border border-violet-700 bg-violet-950/30 p-5">
                  <h3 className="text-xl font-bold text-violet-300">
                    Experimental ML Temperature Prediction
                  </h3>

                  <p className="mt-3 text-3xl font-bold">
                    {prediction.predicted_temperature}°C
                  </p>

                  <p className="mt-2 text-slate-300">
                    Model: {prediction.model_type}
                  </p>

                  <p className="mt-1 text-slate-300">
                    Mean Absolute Error: {prediction.mean_absolute_error}°C
                  </p>

                  <p className="mt-3 text-sm text-amber-300">
                    Experimental result based on synthetic sample data.
                    This is not an actual weather forecast.
                  </p>
                </div>
              )}

                  Weather Advice
                </h3>

                <div className="mt-3 space-y-3">
                  <p className="text-slate-200">
                    {weather.current.temperature_2m >= 40
                      ? "Extreme heat: avoid outdoor activity and stay in a cool place."
                      : weather.current.temperature_2m >= 35
                      ? "Very hot: drink water regularly and avoid direct afternoon sunlight."
                      : weather.current.temperature_2m >= 30
                      ? "Hot weather: stay hydrated and wear light clothing."
                      : weather.current.temperature_2m >= 20
                      ? "Mild temperature: conditions may be comfortable for outdoor activities."
                      : "Cool weather: consider carrying a light jacket."}
                  </p>

                  <p className="text-slate-200">
                    {weather.current.relative_humidity_2m >= 80
                      ? "Humidity is high, which may make the air feel uncomfortable."
                      : weather.current.relative_humidity_2m >= 60
                      ? "Humidity is moderate to high. Stay hydrated during outdoor activities."
                      : "Humidity is relatively low. Continue drinking water throughout the day."}
                  </p>

                  <p className="text-slate-200">
                    {weather.current.wind_speed_10m >= 40
                      ? "Very strong winds: take care and follow local weather alerts."
                      : weather.current.wind_speed_10m >= 25
                      ? "Windy conditions: be cautious around loose objects."
                      : "Winds are relatively light at the moment."}
                  </p>
                </div>
              </div>

<div className="mt-6 rounded-2xl border border-amber-800 bg-amber-950/30 p-5">
  <h3 className="text-xl font-bold text-amber-300">
    UV Index ☀️
  </h3>

  <p className="mt-3 text-3xl font-bold">
    {weather.daily.uv_index_max[0] ?? "N/A"}
  </p>

  <p className="mt-2 text-slate-300">
    {weather.daily.uv_index_max[0] < 3
      ? "Low: Minimal sun protection is generally needed."
      : weather.daily.uv_index_max[0] < 6
      ? "Moderate: Consider sunscreen and sunglasses."
      : weather.daily.uv_index_max[0] < 8
      ? "High: Use sunscreen and limit midday sun exposure."
      : weather.daily.uv_index_max[0] < 11
      ? "Very high: Seek shade and use sun protection."
      : "Extreme: Avoid prolonged direct sunlight."}
  </p>
</div>

              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                
{airQuality && (
  <div className="mt-6 rounded-2xl border border-emerald-800 bg-emerald-950/30 p-5">
    <h3 className="text-xl font-bold text-emerald-300">
      Air Quality Index (AQI)
    </h3>

    <p className="mt-3 text-3xl font-bold">
      {airQuality.current.us_aqi}
    </p>

    <p className="mt-2 text-slate-300">
      {airQuality.current.us_aqi <= 50
        ? "Good: Air quality is satisfactory."
        : airQuality.current.us_aqi <= 100
        ? "Moderate: Sensitive individuals should take care."
        : airQuality.current.us_aqi <= 150
        ? "Unhealthy for sensitive groups."
        : airQuality.current.us_aqi <= 200
        ? "Unhealthy: Consider reducing outdoor activity."
        : airQuality.current.us_aqi <= 300
        ? "Very unhealthy: Avoid prolonged outdoor activity."
        : "Hazardous: Limit outdoor exposure."}
    </p>

    <div className="mt-4 grid grid-cols-2 gap-4">
      <div className="rounded-xl bg-slate-800 p-4">
        <p className="text-sm text-slate-400">PM2.5</p>
        <p className="mt-1 text-xl font-semibold">
          {airQuality.current.pm2_5} µg/m³
        </p>
      </div>

      <div className="rounded-xl bg-slate-800 p-4">
        <p className="text-sm text-slate-400">PM10</p>
        <p className="mt-1 text-xl font-semibold">
          {airQuality.current.pm10} µg/m³
        </p>
      </div>
    </div>
  </div>
)}

                <div className="rounded-2xl bg-slate-800 p-5">
                  <p className="text-slate-400">Humidity</p>
                  <p className="mt-2 text-2xl font-bold">
                    {weather.current.relative_humidity_2m}%
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-800 p-5">
                  <p className="text-slate-400">Wind Speed</p>
                  <p className="mt-2 text-2xl font-bold">
                    {weather.current.wind_speed_10m} km/h
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-800 p-5">
                  <p className="text-slate-400">Feels Like</p>
                  <p className="mt-2 text-2xl font-bold">
                    {weather.current.apparent_temperature}°C
                  </p>
                </div>
              </div>

              <div className="mt-10 rounded-2xl border border-slate-700 bg-slate-900 p-5">
                <h3 className="mb-5 text-2xl font-bold">
                  Temperature Trend
                </h3>

                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={hourlyForecast.map(({ time, temperature }) => ({
                        time: new Date(
                          time.replace(" ", "T") + "+05:30"
                        ).toLocaleTimeString("en-IN", {
                          hour: "numeric",
                          minute: "2-digit",
                          timeZone: "Asia/Kolkata",
                        }),
                        temperature,
                      }))}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#334155"
                      />
                      <XAxis dataKey="time" stroke="#cbd5e1" />
                      <YAxis stroke="#cbd5e1" unit="°C" />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="temperature"
                        stroke="#22d3ee"
                        strokeWidth={3}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="mt-10">
                <h3 className="mb-4 text-2xl font-bold">
                  Hourly Temperature Forecast
                </h3>

                <div className="flex gap-3 overflow-x-auto pb-4">
                  {hourlyForecast.map(({ time, temperature }) => (
                    <div
                      key={time}
                      className="min-w-24 rounded-xl border border-slate-700 bg-slate-800 p-4 text-center"
                    >
                      <p className="text-sm text-slate-300">
                        {new Date(
                          time.replace(" ", "T") + "+05:30"
                        ).toLocaleTimeString("en-IN", {
                          hour: "numeric",
                          minute: "2-digit",
                          timeZone: "Asia/Kolkata",
                        })}
                      </p>
                      <p className="mt-3 text-xl font-bold text-cyan-300">
                        {temperature}°C
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-10">
                <h3 className="mb-4 text-2xl font-bold">
                  7-Day Weather Forecast
                </h3>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-7">
                  {weather.daily.time.map((day, index) => (
                    <div
                      key={day}
                      className="rounded-xl border border-slate-700 bg-slate-800 p-4"
                    >
                      <p className="text-sm text-slate-300">
                        {new Date(day + "T12:00:00").toLocaleDateString(
                          "en-IN",
                          {
                            weekday: "short",
                            day: "numeric",
                          }
                        )}
                      </p>
                      <p className="mt-3 text-lg font-bold text-cyan-300">
                        {weather.daily.temperature_2m_max[index]}°C
                      </p>
                      <p className="mt-1 text-slate-400">
                        Low: {weather.daily.temperature_2m_min[index]}°C
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </section>

        <p className="mt-8 text-center text-sm text-slate-500">
          Weather data provided by Open-Meteo
        </p>
      </div>
    </main>
  );
}
