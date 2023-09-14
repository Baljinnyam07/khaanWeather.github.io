const apiKey = "31b1715eea27e8546c5192709d456eb7";
const mainEl = $("#main");

let lat = "47.99881303648677";
let lon = "107.08058036907485";
let url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}&exclude=hourly`;
let cityName = "Ulaanbaatar";
let firstLoad = true;

const searchBtn = $("#search-btn");
const searchInput = $("#search-input"); // Added this line
const searchDiv = $("#search");
const selectorDiv = $("#selector");
const prevSearchDiv = $("#previous-searches");
const cityList = $("#city-list");

const kelvinToCelsius = tempKel => tempKel - 273.15; // -273.15 kelvin = 0 deg cel

const isInList = (currentId = "") => {
    if ($(`[data-city-id="${currentId}"]`).length) {
        return true;
    } else {
        return false;
    }
}

// Function to populate the list of cities when the page loads
const populateCityList = () => {
    cities.forEach((city) => {
        const listItem = document.createElement("button");
        listItem.textContent = `${city.name}, ${city.country}`;
        listItem.addEventListener("click", () => {
            loadCityData(city);
        });
        cityList.append(listItem);
    });
};

// Call the populateCityList function when the page loads
$(document).ready(() => {
    populateCityList();
});

const populatePreviouslySearched = () => {
    let prevCitiesArr = getCitiesFromLocalStorage();
    for (i in prevCitiesArr) {
        const currentCityObj = {
            "cityLat": prevCitiesArr[i].cityLat,
            "cityLon": prevCitiesArr[i].cityLon,
            "cityName": prevCitiesArr[i].cityName,
            "cityCountry": prevCitiesArr[i].cityCountry,
            "cityId": prevCitiesArr[i].cityId
        };
        addToPreviouslySearched(currentCityObj);
    }
}

const clearPreviouslySearched = () => {
    window.localStorage.setItem("prevCities", "[]");
    $("#previous-searches").text("");
}

const addToPreviouslySearched = currentCityObj => {
    const cityLon = currentCityObj.cityLon;
    const cityLat = currentCityObj.cityLat;
    const cityName = currentCityObj.cityName;
    const cityCountry = currentCityObj.cityCountry;
    const cityId = currentCityObj.cityId;
    if (isInList(cityId)) {
        $(`[data-city-id="${cityId}"]`).remove();
    }
    prevSearchDiv.prepend($(`<span>${cityName}, ${cityCountry}</span>`)
        .attr("data-city-lon", `${cityLon}`)
        .attr("data-city-lat", `${cityLat}`)
        .attr("data-city-name", `${cityName}`)
        .attr("data-city-country", `${cityCountry}`)
        .attr("data-city-id", `${cityId}`)
        .attr("class", "prev-searched")
        .on("click", loadNewData));
}

const addToLocalStorage = cityToAdd => {
    let prevCitiesArr = getCitiesFromLocalStorage();
    prevCitiesArr.push(cityToAdd);
    prevCitiesStr = JSON.stringify(prevCitiesArr);
    window.localStorage.setItem("prevCities", prevCitiesStr);
}

const getCitiesFromLocalStorage = () => {
    prevCitiesArr = JSON.parse(window.localStorage.getItem("prevCities"));
    if (!prevCitiesArr) {
        prevCitiesArr = [];
    }
    return prevCitiesArr;
}

const showFoundCities = () => {
    selectorDiv.removeClass("selector-hidden").addClass("selector-visible");
    searchDiv.css({ 'display': 'none' }); // Used searchDiv here
}

const clearAndHideFoundCities = () => {
    selectorDiv.empty();
    selectorDiv.removeClass("selector-visible").addClass("selector-hidden");
    searchDiv.css({ 'display': 'flex' }); // Used searchDiv here
    searchInput.val(""); // Clear the search input
}

const getEndPoint = (cityLat, cityLon) => {
    let endpoint = `https://api.openweathermap.org/data/2.5/onecall?lat=${cityLat}&lon=${cityLon}&appid=${apiKey}&exclude=hourly`;
    return endpoint;
}

const loadNewData = event => {
    const curCityLon = $(event.target).data("city-lon");
    const curCityLat = $(event.target).data("city-lat");
    const curCityName = $(event.target).data("city-name");
    cityName = curCityName;
    const curCityCountry = $(event.target).data("city-country");
    const curCityId = $(event.target).data("city-id");
    getDataThenPopulatePage(getEndPoint(curCityLat, curCityLon));
    clearAndHideFoundCities();
    currentCityObj = {
        "cityLat": curCityLat,
        "cityLon": curCityLon,
        "cityName": curCityName,
        "cityCountry": curCityCountry,
        "cityId": curCityId
    };
    addToLocalStorage(currentCityObj);
    addToPreviouslySearched(currentCityObj);
}

const searchCity = () => {
    selectorDiv.empty();
    const arrCity = cities.filter(city => city.name == cityName);
    if (arrCity.length > 0 && cityName != "") {
        for (i in arrCity) {
            showCitiesFound(arrCity[i]);
        }
    } else {
        showFoundCities();
        selectorDiv.append($(`<p>City not found, Please search again</p>`));
        selectorDiv.on("click", clearAndHideFoundCities);
    }
}

const showCitiesFound = currentCity => {
    const cityId = currentCity.id;
    const cityLon = currentCity.coord.lon;
    const cityLat = currentCity.coord.lat;
    const cityName = currentCity.name;
    const cityCountry = currentCity.country;
    showFoundCities();
    selectorDiv.append($(`<span>${cityName}, ${cityCountry}</span><br>`)
        .attr("data-city-lon", `${cityLon}`)
        .attr("data-city-lat", `${cityLat}`)
        .attr("data-city-name", `${cityName}`)
        .attr("data-city-country", `${cityCountry}`)
        .attr("data-city-id", `${cityId}`)
        .on("click", loadNewData));
}

const loadCityData = (city) => {
    // Update the weather data based on the selected city
    const cityLat = city.coord.lat;
    const cityLon = city.coord.lon;
    const cityId = city.id;

    const endpoint = getEndPoint(cityLat, cityLon);

    // Fetch and update weather data
    fetch(endpoint)
        .then((response) => response.json())
        .then((data) => {
            updateFiveDay(data.daily);
            updateToday(data.daily[0]);
        });

    // Update the city name in the weather display
    $("#city-name")[0].textContent = `${city.name}, ${city.country}`;
}

// Add an event listener to each city list item to load its data
const cityListItems = document.querySelectorAll("#city-list li");
cityListItems.forEach((listItem, index) => {
    listItem.addEventListener("click", () => {
        loadCityData(cities[index]);
    });
});

const intToMonth = monthAsInt => {
    let month = "";
    switch (monthAsInt) {
        case 0:
            month = "January";
            break;
        case 1:
            month = "February"; // Corrected the typo
            break;
        case 2:
            month = "March";
            break;
        case 3:
            month = "April";
            break;
        case 4:
            month = "May";
            break;
        case 5:
            month = "June";
            break;
        case 6:
            month = "July";
            break;
        case 7:
            month = "August";
            break;
        case 8:
            month = "September";
            break;
        case 9:
            month = "October";
            break;
        case 10:
            month = "November"; // Corrected the typo
            break;
        case 11:
            month = "December";
    }
    return month;
}

const intToDay = dayAsInt => {
    let day = "Weather";
    switch (dayAsInt) {
        case 0:
            day = "Sunday";
            break;
        case 1:
            day = "Monday";
            break;
        case 2:
            day = "Tuesday";
            break;
        case 3:
            day = "Wednesday";
            break;
        case 4:
            day = "Thursday";
            break;
        case 5:
            day = "Friday";
            break;
        case 6:
            day = "Saturday";
    }
    return day;
}

const updateFiveDay = daysData => {
    for (let i = 0; i < 5; i++) {
        const currentDiv = $(`div[data-fiveday="${i}"]`)[0];
        const currentMax = Math.round(kelvinToCelsius(daysData[i].temp.max));
        const currentMin = Math.round(kelvinToCelsius(daysData[i].temp.min));
        const currentWind = daysData[i].wind_speed;
        const currentHumidity = daysData[i].humidity;
        const currentIcon = daysData[i].weather[0].icon;
        const currentIconSrc = `http://openweathermap.org/img/wn/${currentIcon}@2x.png`;
        const date = new Date(daysData[i].dt * 1000);
        const day = intToDay(date.getDay());
        console.log('date:', date, 'day:', day)
        $(currentDiv).children(".max")[0].textContent = `Max: ${currentMax}°C`;
        $(currentDiv).children(".min")[0].textContent = `Min: ${currentMin}°C`;
        $(currentDiv).children(".wind")[0].textContent = `Wind: ${currentWind}mph`;
        $(currentDiv).children(".humidity")[0].textContent = `Humidity: ${currentHumidity}%`;
        $(currentDiv).children(".weather-img")[0].src = currentIconSrc;
        $(currentDiv).children(".day")[0].textContent = day;
    }
}

const updateToday = todayData => {
    const max = Math.round(kelvinToCelsius(todayData.temp.max));
    const min = Math.round(kelvinToCelsius(todayData.temp.min));
    const wind = todayData.wind_speed;
    const humidity = todayData.humidity;
    const iconSrc = todayData.weather[0].icon;

    const uv = todayData.uvi;
    const date = new Date(todayData.dt * 1000);
    const day = intToDay(date.getDay());
    const dayMonth = date.getDate();
    const month = intToMonth(date.getMonth());
    $("#today-max")[0].textContent = `Max: ${max}°C`;
    $("#today-min")[0].textContent = `Min: ${min}°C`;
    $("#today-wind")[0].textContent = `Wind: ${wind}mph`;
    $("#today-humidity")[0].textContent = `Humidity: ${humidity}%`;
    $("#today-img")[0].src = `http://openweathermap.org/img/wn/${iconSrc}@2x.png`;
    $("#city-name")[0].textContent = `${curCityName}, ${curCityCountry}`;
    $("#today-uv")[0].textContent = `UV: ${uv}`;
    $("#todays-date")[0].textContent = `${day}, ${dayMonth} ${month}`;

    if (uv < 3) {
        $("#today-uv").removeClass("moderate-uv severe-uv").addClass("favorable-uv");
    } else if (uv < 6) {
        $("#today-uv").removeClass("favorable-uv severe-uv").addClass("moderate-uv");
    } else {
        $("#today-uv").removeClass("favorable-uv moderate-uv").addClass("severe-uv");
    }
}

const getDataThenPopulatePage = (givenUrl = url) => {
    fetch(givenUrl)
        .then(response => response.json())
        .then(data => {
            updateFiveDay(data.daily);
            updateToday(data.daily[0]);
            if (firstLoad) {
                populatePreviouslySearched();
                firstLoad = false;
            }
        })
        .catch(error => {
            console.error("Error fetching weather data:", error);
        });
}

getDataThenPopulatePage();

searchBtn.click(event => {
    event.preventDefault();
    let tmpCityName = searchInput.val();
    if (tmpCityName.trim()) {
        tmpCityName = tmpCityName.trim();
        tmpCityName = tmpCityName.toLowerCase();
        cityName = tmpCityName[0].toUpperCase() + tmpCityName.slice(1);
        searchCity();
    }
});

$("#clear-history").on("click", clearPreviouslySearched);
