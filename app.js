const apikey = "9a3e35985b6cf9929413bb10276eeee6";
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";

const searchInput = document.querySelector(".search input");
const searchBtn = document.querySelector(".search button");

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

searchBtn.addEventListener("click", () => {
    checkWeather(searchInput.value.trim());
});

searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") checkWeather(searchInput.value.trim());
});
