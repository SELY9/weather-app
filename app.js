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
const locBtn = document.querySelector(".loc-btn");

async function checkWeather(city) {
    if (!city) return;

    // Try fetching weather for the given city
    const response = await fetch(apiUrl + city + `&appid=${apikey}`);

    if (response.status === 404) {
        cityEl.textContent = "City not found";

        // Get coordinates of the typed city for reverse geocoding
        const geoResponse = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apikey}`);
        const geoData = await geoResponse.json();

        if (geoData.length === 0) {
            // If city doesn't exist anywhere, just stop here
            tempEl.textContent = "--°C";
            humidityEl.textContent = "--%";
            windEl.textContent = "-- km/h";
            weatherIcon.src = "images/clear.png";
            return;
        }

        const { lat, lon } = geoData[0];

        // Now fetch the weather for the nearest city based on lat/lon
        const nearestWeatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apikey}`);
        const nearestWeatherData = await nearestWeatherResponse.json();

        if (nearestWeatherData) {
            cityEl.textContent = nearestWeatherData.name;
            tempEl.textContent = Math.round(nearestWeatherData.main.temp) + "°C";
            humidityEl.textContent = nearestWeatherData.main.humidity + "%";
            windEl.textContent = nearestWeatherData.wind.speed + " km/h";

            const main = nearestWeatherData.weather[0].main.toLowerCase();
            if (main.includes("cloud")) weatherIcon.src = "images/clouds.png";
            else if (main.includes("rain")) weatherIcon.src = "images/rain.png";
            else if (main.includes("drizzle")) weatherIcon.src = "images/drizzle.png";
            else if (main.includes("mist")) weatherIcon.src = "images/mist.png";
            else weatherIcon.src = "images/clear.png";
        }

    } else {
        // Continue with the normal weather check if the city is found
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
}

async function getCityFromCoords(lat, lon){
    const url = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apikey}`;
    const res = await fetch (url);
    const data = await res.json ();

    if (data.length > 0){
        return data[0].name;
    }else{
        return null;
    }
}
async function fetchCitySuggestions(query) {
    if (query.length < 3) {
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

    // REMOVE DUPLICATES
    const uniqueCities = [];
    const filteredData = data.filter(c => {
        const key = `${c.name}-${c.country}`;
        if (uniqueCities.includes(key)) return false;
        uniqueCities.push(key);
        return true;
    });

    // FILTER OUT REGION-LIKE NAMES (Administrative regions, not cities)
    const validCities = filteredData.filter(city => {
        // Skip if the city name includes region-like terms (i.e., Special Capital Region, Province, Autonomous)
        const regionNames = ["Special Capital Region", "Province", "Autonomous Region"];
        const isRegion = regionNames.some(region => city.name.includes(region));

        // Valid city must not include these terms
        const isValidCity = !isRegion && city.name.length > 1 && !city.state;

        return isValidCity;
    });

    // SHOW CLEANED AND VALID RESULTS
    validCities.forEach(city => {
        const item = document.createElement("div");
        item.classList.add("suggestion-item");
        item.textContent = `${city.name}, ${city.country}`;

        item.addEventListener("click", () => {
            let fullName = city.name;
            if (city.state) {
                fullName = `${city.name} ${city.state}`;
            }

            searchInput.value = fullName;
            suggestionsBox.style.display = "none";
            checkWeather(fullName); // Fetch weather for the full city name
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

navigator.geolocation.getCurrentPosition(async(position) =>{
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    const city =await getCityFromCoords (lat, lon);

    if (city){
        searchInput.value = city ;
        checkWeather(city);
    }else{
        cityEl.textContent ="Location not found";
    }
});


locBtn.addEventListener("click", () => {
    console.log("Location button clicked"); // test

    navigator.geolocation.getCurrentPosition(async (position) => {

        console.log("Geolocation allowed"); // test

        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        const city = await getCityFromCoords(lat, lon);

        console.log("City from coords:", city); // test

        if (city) {
            searchInput.value = city;
            checkWeather(city);
        } else {
            cityEl.textContent = "Location not found";
        }
    },
    (error) => {
        console.log("Geolocation error:", error); 
        alert("Please allow location access for this to work.");
    });
});

