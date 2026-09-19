
class ExtremeTemperatureError extends Error {

    constructor(message) {

        super(message);

        this.name = "ExtremeTemperatureError";

    }

}


/* =========================================
   DOM ELEMENTS
========================================= */

let searchBtn =
    document.getElementById("searchBtn");

let cityInput =
    document.getElementById("cityInput");

let result =
    document.getElementById("result");


let searchBox =
    cityInput.parentElement;


/* =========================================
   SUGGESTION BOX
========================================= */

let suggestionBox =
    document.createElement("div");

suggestionBox.className =
    "suggestion-box";

searchBox.appendChild(
    suggestionBox
);


let autocompleteTimer;


/* =========================================
   CITY INPUT
========================================= */

cityInput.addEventListener(
    "input",
    function () {

        let city =
            cityInput.value.trim();


        clearTimeout(
            autocompleteTimer
        );


        if (city.length < 2) {

            suggestionBox.innerHTML =
                "";

            suggestionBox.style.display =
                "none";

            searchBox.classList.remove(
                "suggestions-open"
            );

            return;

        }


        autocompleteTimer =
            setTimeout(
                function () {

                    getCitySuggestions(city);

                },
                400
            );

    }
);


/* =========================================
   CITY SUGGESTIONS
========================================= */

async function getCitySuggestions(city) {

    try {

        const response =
            await fetch(
                `/api/suggestions?city=${encodeURIComponent(city)}`
            );


        if (!response.ok) {

            suggestionBox.style.display =
                "none";

            searchBox.classList.remove(
                "suggestions-open"
            );

            return;

        }


        const locations =
            await response.json();


        suggestionBox.innerHTML =
            "";


        if (locations.length === 0) {

            suggestionBox.style.display =
                "none";

            searchBox.classList.remove(
                "suggestions-open"
            );

            return;

        }


        locations.forEach(
            function (location) {

                let item =
                    document.createElement("div");


                item.className =
                    "suggestion-item";


                let state =
                    location.state
                        ? `, ${location.state}`
                        : "";


                item.innerHTML = `

                    <span class="suggestion-icon">
                        📍
                    </span>

                    <span>

                        <strong>
                            ${location.name}
                        </strong>

                        <small>
                            ${state}
                            ${state ? "," : ""}
                            ${location.country}
                        </small>

                    </span>

                `;


                item.addEventListener(
                    "click",
                    function () {

                        cityInput.value =
                            location.name;

                        suggestionBox.innerHTML =
                            "";

                        suggestionBox.style.display =
                            "none";

                        searchBox.classList.remove(
                            "suggestions-open"
                        );

                    }
                );


                suggestionBox.appendChild(
                    item
                );

            }
        );


        suggestionBox.style.display =
            "block";


        searchBox.classList.add(
            "suggestions-open"
        );

    }


    catch (error) {

        console.error(
            "Autocomplete error:",
            error
        );

    }

}


/* =========================================
   CLOSE SUGGESTIONS WHEN CLICKING OUTSIDE
========================================= */

document.addEventListener(
    "click",
    function (event) {

        if (
            !cityInput.contains(event.target) &&
            !suggestionBox.contains(event.target)
        ) {

            suggestionBox.style.display =
                "none";


            searchBox.classList.remove(
                "suggestions-open"
            );

        }

    }
);


/* =========================================
   GET WEATHER
========================================= */

async function getWeather(city) {


    if (city.trim() === "") {

        throw new Error(
            "Please enter a city name."
        );

    }


    const response =
        await fetch(
            `/api/weather?city=${encodeURIComponent(city)}`
        );


    if (!response.ok) {

        if (response.status === 401) {

            throw new Error(
                "Invalid API key. Please check your OpenWeather API key."
            );

        }


        if (response.status === 404) {

            throw new Error(
                "City not found. Please check the city name."
            );

        }


        throw new Error(
            "Unable to get weather information."
        );

    }


    const data =
        await response.json();


    const temperature =
        data.main.temp;


    if (
        temperature < 0 ||
        temperature > 40
    ) {

        throw new ExtremeTemperatureError(

            `Extreme temperature detected: ${temperature}°C`

        );

    }


    return {

        city:
            data.name,

        country:
            data.sys.country,

        temperature:
            data.main.temp,

        feelsLike:
            data.main.feels_like,

        humidity:
            data.main.humidity,

        windSpeed:
            data.wind.speed,

        condition:
            data.weather[0].main,

        description:
            data.weather[0].description

    };

}


/* =========================================
   GET WEATHER AND DISPLAY
========================================= */

async function getWeatherAndDisplay(city) {


    suggestionBox.innerHTML =
        "";

    suggestionBox.style.display =
        "none";

    searchBox.classList.remove(
        "suggestions-open"
    );


    result.innerHTML = `

        <div class="empty-state">

            <div class="empty-icon">
                🌤️
            </div>

            <p>
                Getting weather information...
            </p>

        </div>

    `;


    try {


        let weather =
            await getWeather(city);


        let condition =
            weather.condition;


        result.innerHTML = `

            <div class="weather-card">


                <!-- CITY -->

                <div class="location">

                    📍 ${weather.city},
                    ${weather.country}

                </div>


                <!-- MAIN ICON -->

                <div class="weather-icon">

                    ${getWeatherIcon(condition)}

                </div>


                <!-- HIGHLIGHTED CONDITION -->

                <div class="weather-condition">

                    ${getWeatherIcon(condition)}

                    <span>
                        ${formatCondition(condition)}
                    </span>

                </div>


                <!-- TEMPERATURE -->

                <div class="temperature">

                    <h2>

                        ${Math.round(
                            weather.temperature
                        )}°C

                    </h2>

                </div>


                <!-- DESCRIPTION -->

                <p class="weather-description">

                    ${weather.description}

                </p>


                <!-- DETAILS -->

                <div class="weather-details">


                    <div class="weather-detail">

                        <p>
                            🌡️ Feels Like
                        </p>

                        <span>

                            ${Math.round(
                                weather.feelsLike
                            )}°C

                        </span>

                    </div>


                    <div class="weather-detail">

                        <p>
                            💧 Humidity
                        </p>

                        <span>

                            ${weather.humidity}%

                        </span>

                    </div>


                    <div class="weather-detail">

                        <p>
                            💨 Wind
                        </p>

                        <span>

                            ${weather.windSpeed} m/s

                        </span>

                    </div>


                </div>


            </div>

        `;


        changeBackground(condition);

    }


    catch (error) {


        result.innerHTML = `

            <div class="error-message">

                ${
                    error instanceof
                    ExtremeTemperatureError
                    ? "⚠️"
                    : "❌"
                }

                ${error.message}

            </div>

        `;

    }

}


/* =========================================
   SEARCH BUTTON
========================================= */

searchBtn.addEventListener(
    "click",
    function () {

        let city =
            cityInput.value.trim();


        getWeatherAndDisplay(city);

    }
);


/* =========================================
   ENTER KEY SEARCH
========================================= */

cityInput.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {

            event.preventDefault();

            getWeatherAndDisplay(
                cityInput.value.trim()
            );

        }

    }
);


/* =========================================
   WEATHER ICON
========================================= */

function getWeatherIcon(condition) {

    if (condition === "Clear") {

        return "☀️";

    }


    if (condition === "Clouds") {

        return "☁️";

    }


    if (condition === "Rain") {

        return "🌧️";

    }


    if (condition === "Drizzle") {

        return "🌦️";

    }


    if (condition === "Thunderstorm") {

        return "⛈️";

    }


    if (condition === "Snow") {

        return "❄️";

    }


    if (condition === "Mist") {

        return "🌫️";

    }


    if (condition === "Smoke") {

        return "🌫️";

    }


    if (condition === "Haze") {

        return "🌫️";

    }


    if (condition === "Dust") {

        return "🌪️";

    }


    if (condition === "Fog") {

        return "🌫️";

    }


    if (condition === "Sand") {

        return "🌪️";

    }


    if (condition === "Ash") {

        return "🌋";

    }


    if (condition === "Squall") {

        return "💨";

    }


    if (condition === "Tornado") {

        return "🌪️";

    }


    return "🌤️";

}


/* =========================================
   FORMAT CONDITION
========================================= */

function formatCondition(condition) {

    if (condition === "Rain") {

        return "Light Rain";

    }


    if (condition === "Drizzle") {

        return "Drizzle";

    }


    if (condition === "Clear") {

        return "Clear Sky";

    }


    if (condition === "Clouds") {

        return "Cloudy";

    }


    if (condition === "Thunderstorm") {

        return "Thunderstorm";

    }


    if (condition === "Snow") {

        return "Snow";

    }


    return condition;

}


/* =========================================
   CHANGE BACKGROUND
========================================= */

function changeBackground(condition) {

    document.body.classList.remove(

        "sunny",
        "cloudy",
        "rainy",
        "snowy",
        "stormy",
        "default"

    );


    if (condition === "Clear") {

        document.body.classList.add(
            "sunny"
        );

    }


    else if (condition === "Clouds") {

        document.body.classList.add(
            "cloudy"
        );

    }


    else if (
        condition === "Rain" ||
        condition === "Drizzle"
    ) {

        document.body.classList.add(
            "rainy"
        );

    }


    else if (condition === "Snow") {

        document.body.classList.add(
            "snowy"
        );

    }


    else if (
        condition === "Thunderstorm"
    ) {

        document.body.classList.add(
            "stormy"
        );

    }


    else {

        document.body.classList.add(
            "default"
        );

    }

}