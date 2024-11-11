//const {data} = require('pb.js');
let geocode_api = "";
let openweather_api = "";
$(document).ready(function () {
  fetch('var.json')
    .then((response) => response.json())
    .then((json) => {
      geocode_api = json.GEOCODE_API;
      openweather_api = json.OPEN_WEATHER_API;
    });
 
  //changeLanguage("pb");
  $("#searchBtn").click(function () {
    var searchQuery = $("#searchBox").val();
    if (searchQuery != "") {
      search(searchQuery);
    }
  });

  getLoadWeather();

  $("#searchBox").keypress(function (event) {
    var keycode = event.keyCode ? event.keyCode : event.which;
    if (keycode == "13") {
      var searchQuery = $("#searchBox").val();
      if (searchQuery != "") {
        search(searchQuery);
        event.target.blur();
      }
    }
  });
});

function getLoadWeather() {
  const successCallback = (position) => {
    getWeather(position.coords.longitude, position.coords.latitude);
  };

  const errorCallback = (error) => {
    console.log(error);
  };
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
  }
}

//function to change language for the website
//starts to read from different json file for strings
function changeLanguage(language) {
  var head = document.getElementsByTagName("head")[0],
    script = document.createElement("script");

  script.type = "text/javascript";

  if (language == "en") {
    console.log("Switched to EN");
    script.src = language + ".js";

    $('head script[src*="js/pb.js"]').remove(); // for removing dynamically
  } else if (language == "pb") {
    console.log("Switched to PB!");
    script.src = "js/" + language + ".js";
    $('head script[src*="js/en.js"]').remove(); // for removing dynamically
  }
  head.appendChild(script);
  let input = dataLanguage;
  //const obj = JSON.parse(input);
  $("#searchBtn").html(input.getWeather);
  $("#footer").html(input.footerNote);
  $("#pageHeading").html(input.pageHeading);
}

function search(searchQuery) {
  console.log(searchQuery);
  getLonLat(searchQuery);
}

//google servive to get latitude and longitude
//takes a search query for input
function getLonLat(searchQuery) {
  fetch(
    "https://geocode.maps.co/search?q=" + searchQuery + "&api_key="+geocode_api
  )
    .then((response) => response.json())
    .then(function (data) {

      console.log(data[0]);
      $("#formattedAddress").html(data[0].display_name);
      getWeather(
        data[0].lon,
        data[0].lat
      );
    });
}

function getWeeklyWeather(lon, lat, cnt) {
  fetch(
    "https://api.openweathermap.org/data/2.5/forecast/daily?lat=" +
    lat +
    "&lon=" +
    lon +
    "&cnt=" +
    cnt +
    "&appid="+openweather_api
  )
    .then((response) => response.json())
    .then(function (data) {
      console.log(data);
      updateWeeklyUI(data, cnt);
    });
}

//takes latitude and longitude as parameters
//return weather data from openweather API
function getWeather(lon, lat) {
  console.log(lon + " " + lat);
  fetch(
    "https://api.openweathermap.org/data/2.5/weather?lat=" +
    lat +
    "&lon=" +
    lon +
    "&units=metric&appid="+openweather_api
  )
    .then((response) => response.json())
    .then(function (data) {
      updateUI(data);
      getWeeklyWeather(lon, lat, 7);
    });
}

function updateWeeklyUI(data, cnt) {
  for (let i = 1; i < cnt; i++) {
    let dayname = new Date(data.list[i].dt * 1000).toLocaleDateString("en", {
      weekday: "long",
    });
    $("#column-2 div:nth-child(" + i + ")").html(
      `<p>${dayname}</p>` +
      `<img src=${getWeatherIcon(
        data.list[i].weather[0].icon
      )} class="dailyWeatherItemImg" />` +
      `<p>${Math.round(data.list[i].temp.day - 273.15)}°C</p>` +
      `<p>${data.list[i].weather[0].main}</p>`
    );
  }
}

function changeSource(url) {
  let temp = url;
  $.get(temp)
    .done(function () {
      // exists code
      $("#videoSource").attr("src", temp);
      $("#backgroundVideo")[0].load();
      $("#backgroundVideo")[0].play();
    })
    .fail(function () {
      $("#videoSource").attr("src", "images/clear.mp4");
      $("#backgroundVideo")[0].load();
      $("#backgroundVideo")[0].play();
    });
}

function updateUI(data) {
  console.log(Math.round(data.main.temp) + "°C");
  $("#weatherTemp").html(Math.round(data.main.temp) + "°C");
  $("#weatherWind").html(
    "Wind:<br>" + Math.round(data.wind.speed * 3.6) + " Km/hr"
  );

  $("#weatherIcon").attr("src", getWeatherIcon(data.weather[0].icon));
  $("#feelsLike").html("[" + Math.round(data.main.feels_like) + "°C]");
  $("#summary").html(data.weather[0].main);
  $("#description").html(data.weather[0].description);
  $("#minMax").html(
    "MIN/MAX:<br>" +
    Math.round(data.main.temp_min) +
    "°C/" +
    Math.round(data.main.temp_max) +
    "°C"
  );
  $("#pressure").html("Pressure:<br>" + data.main.pressure / 10 + " Kpa");
  $("#searchBox").val("");
  //changeSource("images/" + data.weather[0].main + ".mp4");
  console.log(data.weather[0].description);
}

//returns url for right weather icon
//gets icon code from weather api
function getWeatherIcon(iconCode) {
  return "https://openweathermap.org/img/wn/" + iconCode + "@2x.png";
}
