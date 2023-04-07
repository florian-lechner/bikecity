import { context } from "./context.js";


function showLiveWeather() {
    fetch("/getLiveWeather")
      .then((response) => response.json())
      .then((weatherData) => liveWeather(weatherData));
}

function temperatur_graph(tmp, min, max, precipitation_probability) {
  // current temperatur graph
  var current_temp_graph = document.getElementById("current-temp-graph");
  var background = {
    type: 'doughnut',
    data: {
        datasets: [{
            data: [10],
            backgroundColor: [
              'rgba(69, 156, 178, 1)',
            ],
            borderColor: [
              'rgba(35, 35, 35, 1)',
            ],
            borderWidth: 1,
            borderRadius: 4             
        }]

    },
    options: {
        rotation: -120,
        circumference: 240,
        legend: {
            display: false
        },
        tooltip: {
            enabled: false
        },
        events: [],
        cutout: "82%"
    }
  };
  var background_canvas_temp = new Chart(current_temp_graph, background);
  // current temperatur on graph
  // calculate position of currrent temp - if temp = min/max it still shows a little space
  var step_lower = Math.max(10, Math.round((tmp-min)/(max-min)*100));
  var step_upper = Math.max(10, 100-step_lower);
  // display it
  var current_temp_graph_number = document.getElementById("current-temp-graph-number");
  var canvas_temp = new Chart(current_temp_graph_number, {
    type: 'doughnut',
    data: {
        datasets: [{
            data: [step_lower,2,step_upper],
            backgroundColor: [
              "rgba(0,0,0,0)",
               "rgba(176, 239, 255,1)",
                "rgba(0,0,0,0)",
            ],
            borderColor: [
            'rgba(0, 0, 0 ,0)',
            'rgba(176, 239, 255,1)',
            'rgba(0, 0, 0 ,0)'
            ],
            borderWidth: 4,
            borderRadius: 5             
        }]

    },
    options: {
        rotation: -120,
        circumference: 240,
        legend: {
            display: false
        },
        tooltip: {
            enabled: false
        },
        events: [],
        cutout: "90%"
    }
  });

  // current precipitation
  var current_precipitation_number = document.getElementById("current-precipitation-graph");
  var background_canvas_temp = new Chart(current_precipitation_number, background);
  
  // current value on graph
  // calculate position of currrent temp - if temp = min/max it still shows a little space
  var step_lower = precipitation_probability;
  var step_upper = 100-step_lower;
  // display it
  var current_precipitation_number = document.getElementById("current-precipitation-graph-number");
  var canvas_temp = new Chart(current_precipitation_number, {
    type: 'doughnut',
    data: {
        datasets: [{
            data: [step_lower,step_upper],
            backgroundColor: [
               "rgba(176, 239, 255,1)",
                "rgba(0,0,0,0)",
            ],
            borderColor: [
            'rgba(176, 239, 255,1)',
            'rgba(0, 0, 0 ,0)'
            ],
            borderWidth: 4,
            borderRadius: 5             
        }]

    },
    options: {
        rotation: -120,
        circumference: 240,
        legend: {
            display: false
        },
        tooltip: {
            enabled: false
        },
        events: [],
        cutout: "90%"
    }
  });
}

function liveWeather(weatherData) {
  // Find current weather div to append current weather info to
  var liveWeather = document.getElementById("current-weather");
  // Generate live weather HTML
  var liveWeather_text = 
    '<img id="current-weather-icon" src="/static/weather_icons/' + weatherData.icon_number + '.svg" alt="Current weather icon">';
  // Insert the live weather html
  liveWeather.innerHTML = liveWeather_text;
  document.getElementById("current-temp").innerHTML = weatherData.current_temp + '°C';
  document.getElementById("current-min").innerHTML = weatherData.min_temp;
  document.getElementById("current-max").innerHTML = weatherData.max_temp;
  document.getElementById("current-precipitation-probability").innerHTML = weatherData.precipitation_probability + '%';

  temperatur_graph(weatherData.current_temp, weatherData.min_temp, weatherData.max_temp, weatherData.precipitation_probability);
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
    '<p> Forecast <p>' +                 
    '<p><img id="predicted-weather-icon" src="/static/weather_icons/' + weatherData.icon_number + '.svg" alt="Predicted weather icon"><p>' +
    '<p>  ' + weatherData.forecast_temp + '°C';
  // Insert the predicted weather html
  var current_temp_graph = document.getElementById("current-precipitation-graph");
  predictedWeather.innerHTML = predictedWeather_text;
}


export { showLiveWeather, showPredictedWeather };