const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const toggleUnitBtn = document.getElementById("toggleUnitBtn");
const statusMsg = document.getElementById("statusMsg");
const currentCard = document.getElementById("currentCard");
const cityNameEl = document.getElementById("cityName");
const tempEl = document.getElementById("temp");
const windEl = document.getElementById("wind");
const conditionEl = document.getElementById("condition");
const forecastBody = document.getElementById("forecastBody");
const thMax = document.getElementById("thMax");
const thMin = document.getElementById("thMin");

let isCelsius = true;
let currentPlace = null;
let currentWeatherData = null;

// ============================================================
// TASK 1 — WEATHER CODE DESCRIPTION
// ============================================================
function describeWeatherCode(code) {
  if (code === 0) return "Clear sky";
  if (code >= 1 && code <= 3) return "Partly cloudy";
  if (code === 45 || code === 48) return "Fog";
  if (code >= 51 && code <= 57) return "Drizzle";
  if (code >= 61 && code <= 67) return "Rain";
  if (code >= 71 && code <= 77) return "Snow";
  if (code >= 80 && code <= 82) return "Rain showers";
  if (code >= 95 && code <= 99) return "Thunderstorm";
  return "Unknown";
}

// ============================================================
// TASK 2 — STATUS MESSAGE
// ============================================================
function setStatus(message, isError = false) {
  statusMsg.textContent = message;
  if (isError) {
    statusMsg.classList.add("error");
  } else {
    statusMsg.classList.remove("error");
  }
}

// ============================================================
// API FUNCTION 1 — GEOCODING
// ============================================================
async function geocodeCity(city) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Geocoding request failed");
  }
  const data = await res.json();
  if (!data.results || data.results.length === 0) {
    throw new Error("City not found — try another name.");
  }
  console.log("Geocoding coordinates:", data.results[0]); // Confirm coordinates are correct
  return data.results[0];
}

// ============================================================
// API FUNCTION 2 — WEATHER FORECAST
// ============================================================
async function fetchForecast(lat, lon) {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current_weather=true` +
    `&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum` +
    `&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Forecast request failed");
  }
  return res.json();
}

// ============================================================
// TASK 3 — DISPLAY CURRENT WEATHER
// ============================================================
function renderCurrentWeather(place, weatherData) {
  const current = weatherData.current_weather;
  const placeName = place.country ? `${place.name}, ${place.country}` : place.name;
  
  cityNameEl.textContent = placeName;
  
  let temp = current.temperature;
  let unit = "°C";
  
  if (!isCelsius) {
    temp = (temp * 9/5) + 32;
    unit = "°F";
  }
  
  tempEl.textContent = `${temp.toFixed(1)} ${unit}`;
  windEl.textContent = `${current.windspeed} km/h`;
  conditionEl.textContent = describeWeatherCode(current.weathercode);
  
  currentCard.classList.remove("hidden");
}

// ============================================================
// TASK 4 — CREATE THE FORECAST TABLE
// ============================================================
function renderForecastTable(daily) {
  forecastBody.innerHTML = "";
  
  // Update headers
  thMax.textContent = isCelsius ? "Max °C" : "Max °F";
  thMin.textContent = isCelsius ? "Min °C" : "Min °F";
  
  for (let i = 0; i < daily.time.length; i++) {
    const tr = document.createElement("tr");
    
    // Stretch goal: Highlight rainy days
    if (daily.precipitation_sum[i] > 0) {
      tr.classList.add("rainy");
    }
    
    const tdDate = document.createElement("td");
    tdDate.textContent = daily.time[i];
    
    const tdCondition = document.createElement("td");
    tdCondition.textContent = describeWeatherCode(daily.weathercode[i]);
    
    let maxTemp = daily.temperature_2m_max[i];
    let minTemp = daily.temperature_2m_min[i];
    
    if (!isCelsius) {
      maxTemp = (maxTemp * 9/5) + 32;
      minTemp = (minTemp * 9/5) + 32;
    }
    
    const tdMax = document.createElement("td");
    tdMax.textContent = maxTemp.toFixed(1);
    
    const tdMin = document.createElement("td");
    tdMin.textContent = minTemp.toFixed(1);
    
    const tdPrecip = document.createElement("td");
    tdPrecip.textContent = daily.precipitation_sum[i];
    
    tr.appendChild(tdDate);
    tr.appendChild(tdCondition);
    tr.appendChild(tdMax);
    tr.appendChild(tdMin);
    tr.appendChild(tdPrecip);
    
    forecastBody.appendChild(tr);
  }
}

// ============================================================
// TASK 5 — HANDLE SEARCH
// ============================================================
async function handleSearch() {
  const city = cityInput.value.trim();
  
  if (!city) {
    setStatus("Please type a city name.", true);
    return;
  }
  
  currentCard.classList.add("hidden");
  forecastBody.innerHTML = "";
  setStatus("Loading…", false);
  
  try {
    currentPlace = await geocodeCity(city);
    currentWeatherData = await fetchForecast(currentPlace.latitude, currentPlace.longitude);
    
    renderCurrentWeather(currentPlace, currentWeatherData);
    renderForecastTable(currentWeatherData.daily);
    
    setStatus("", false);
  } catch (err) {
    setStatus(err.message, true);
  }
}

// ============================================================
// TASK 6 — SEARCH BUTTON EVENT
// ============================================================
searchBtn.addEventListener("click", handleSearch);

// ============================================================
// TASK 7 — ENTER KEY SUPPORT
// ============================================================
cityInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    handleSearch();
  }
});

// ============================================================
// STRETCH GOAL — TOGGLE UNIT
// ============================================================
toggleUnitBtn.addEventListener("click", () => {
  isCelsius = !isCelsius;
  
  if (currentPlace && currentWeatherData) {
    renderCurrentWeather(currentPlace, currentWeatherData);
    renderForecastTable(currentWeatherData.daily);
  }
});
