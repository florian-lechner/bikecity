import { context } from "./context.js";

function showLiveWeather() {
    fetch("/getLiveWeather")
      .then((response) => response.json())
      .then((weatherData) => liveWeather(weatherData));
}

function liveWeather(weatherData) {
  // Find current weather div to append current weather info to
  var liveWeather = document.getElementById("current-weather");
  // Generate live weather HTML
  var liveWeather_text = 
    '<div id="current-weather-text">' +
    '<p> Current Weather <p>' +                 // weather icon not working yet
    '<p><img id="current-weather-icon" src="/static/weather_icons/' + weatherData.icon_number + '.png" alt="Current weather icon"><p>' +
    '<p>  ' + weatherData.current_temp + '°C, Feels like '+ weatherData.temperature_feels_like +'°C<p>' + '</div>';
  // Insert the live weather html
  liveWeather.innerHTML = liveWeather_text;
}

function showPredictedWeather(hours) {
  console.log(hours)
  fetch("/getForecastWeather/" + hours)
    .then((response) => response.json())
    .then((weatherData) => predictedWeather(weatherData));
};


function predictedWeather(weatherData) {
  // Find predicted weather div to append predicted weather info to
  var predictedWeather = document.getElementById("predicted-weather");
  // Toggle the display of the predicted weather
  predictedWeather.style.display = "block";
  // Generate predicted weather HTML
  var predictedWeather_text = 
    '<div id="predicted-weather-text">' +
    '<p> Predicted Weather <p>' +                 
    '<p><img id="predicted-weather-icon" src="/static/weather_icons/' + weatherData.icon_number + '.png" alt="Predicted weather icon"><p>' +
    '<p>  ' + weatherData.forecast_temp + '°C';
  // Insert the predicted weather html
  predictedWeather.innerHTML = predictedWeather_text;
}


export { showLiveWeather, showPredictedWeather };