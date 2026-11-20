import { fetchJson } from "../utils/http.util.js";

// Open-Meteo: gratis, sin registro y sin API key.
const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const FORECAST_DAYS = 14;

// Códigos WMO que devuelve Open-Meteo -> texto en español.
const WEATHER_CODES = {
  0: "Despejado",
  1: "Mayormente despejado",
  2: "Parcialmente nublado",
  3: "Nublado",
  45: "Niebla",
  48: "Niebla con escarcha",
  51: "Llovizna débil",
  53: "Llovizna",
  55: "Llovizna intensa",
  56: "Llovizna helada",
  57: "Llovizna helada intensa",
  61: "Lluvia débil",
  63: "Lluvia",
  65: "Lluvia intensa",
  66: "Lluvia helada",
  67: "Lluvia helada intensa",
  71: "Nieve débil",
  73: "Nieve",
  75: "Nieve intensa",
  77: "Granizo fino",
  80: "Chubascos débiles",
  81: "Chubascos",
  82: "Chubascos fuertes",
  85: "Chubascos de nieve",
  86: "Chubascos de nieve fuertes",
  95: "Tormenta",
  96: "Tormenta con granizo",
  99: "Tormenta fuerte con granizo",
};

export const weatherClient = {
  /** Busca las coordenadas de una ciudad. Devuelve null si no la encuentra. */
  async geocode(city) {
    const params = new URLSearchParams({ name: city, count: "1", language: "es", format: "json" });
    const data = await fetchJson(`${GEOCODING_URL}?${params}`);
    const place = data?.results?.[0];
    if (!place) return null;
    return {
      name: place.name,
      region: place.admin1 ?? null,
      country: place.country ?? null,
      latitude: place.latitude,
      longitude: place.longitude,
    };
  },

  /** Previsión diaria de los próximos 14 días en una posición. */
  async dailyForecast(latitude, longitude) {
    const params = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),
      daily: [
        "weather_code",
        "temperature_2m_max",
        "temperature_2m_min",
        "precipitation_probability_max",
        "precipitation_sum",
        "wind_speed_10m_max",
      ].join(","),
      timezone: "Europe/Madrid",
      forecast_days: String(FORECAST_DAYS),
    });
    const data = await fetchJson(`${FORECAST_URL}?${params}`);
    const daily = data.daily;

    return daily.time.map((date, index) => ({
      date,
      summary: WEATHER_CODES[daily.weather_code[index]] ?? "Sin datos",
      tempMaxC: daily.temperature_2m_max[index],
      tempMinC: daily.temperature_2m_min[index],
      rainProbabilityPct: daily.precipitation_probability_max[index],
      rainMm: daily.precipitation_sum[index],
      windMaxKmh: daily.wind_speed_10m_max[index],
    }));
  },

  FORECAST_DAYS,
};
