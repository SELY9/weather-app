const apikey = "9a3e35985b6cf9929413bb10276eeee6";
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";

const searchInput = document.querySelector(".search input");
const searchBtn = document.querySelector(".search button");
const suggestionsBox = document.querySelector(".suggestions")
const cityEl = document.querySelector(".city");
const tempEl = document.querySelector(".temp");
const humidityEl = document.querySelector(".humidity");
const windEl = document.querySelector(".wind");
const weatherIcon = document.querySelector(".weather-icon");

async function checkWeather(city) {

    if (!city) return;

    const response = await fetch(apiUrl + city + `&appid=${apikey}`);

    if (response.status === 404) {
        cityEl.textContent = "City not found";
        tempEl.textContent = "--°C";
        humidityEl.textContent = "--%";
        windEl.textContent = "-- km/h";
        weatherIcon.src = "images/clear.png";
        return;
    }

    const data = await response.json();
    console.log("Weather API data:", data);

    cityEl.textContent = data.name;
    tempEl.textContent = Math.round(data.main.temp) + "°C";
    humidityEl.textContent = data.main.humidity + "%";
    windEl.textContent = data.wind.speed + " km/h";

    const main = data.weather[0].main.toLowerCase();

    if (main.includes("cloud")) weatherIcon.src = "images/clouds.png";
    else if (main.includes("rain")) weatherIcon.src = "images/rain.png";
    else if (main.includes("drizzle")) weatherIcon.src = "images/drizzle.png";
    else if (main.includes("mist")) weatherIcon.src = "images/mist.png";
    else weatherIcon.src = "images/clear.png";
}
async function fetchCitySuggestions(query) {
    if (query.length < 2) {
        suggestionsBox.style.display = "none";
        return;
    }

    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${apikey}`;
    const res = await fetch(url);
    const data = await res.json();

    suggestionsBox.innerHTML = "";

    if (data.length === 0) {
        suggestionsBox.style.display = "none";
        return;
    }

    // REMOVE DUPLICATES HERE (correct location)
    const uniqueCities = [];
    const filteredData = data.filter(c => {
        const key = `${c.name}-${c.country}`;
        if (uniqueCities.includes(key)) return false;
        uniqueCities.push(key);
        return true;
    });

    // SHOW CLEANED RESULTS
    filteredData.forEach(city => {
        const item = document.createElement("div");
        item.classList.add("suggestion-item");
        item.textContent = `${city.name}, ${city.country}`;

        item.addEventListener("click", () => {
            searchInput.value = city.name;
            suggestionsBox.style.display = "none";
            checkWeather(city.name);
        });

        suggestionsBox.appendChild(item);
    });

    suggestionsBox.style.display = "block";
}

searchBtn.addEventListener("click", () => {
    checkWeather(searchInput.value.trim());
});

searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        // On Enter, just check the weather directly using whatever is typed.
        checkWeather(searchInput.value.trim());
        // Optionally hide the suggestions once Enter is pressed
        suggestionsBox.style.display = "none";
    }
});
searchInput.addEventListener("input", () => {
    fetchCitySuggestions(searchInput.value.trim());
});

document.addEventListener("click", (e) => {
    if (!e.target.closest(".search")) {
        suggestionsBox.style.display = "none";
    }
});



