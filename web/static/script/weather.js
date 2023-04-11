import { context } from "./context.js";

// global canvas variables:
var background_canvas_temp;
var canvas_temp;
var background_precipitation_number_canvas;
var precipitation_number_canvas;


function showLiveWeather() {
    fetch("/getLiveWeather")
      .then((response) => response.json())
      .then((weatherData) => liveWeather(weatherData));
}

function temperatur_graph(tmp, min, max, precipitation_probability , cur_pre) {
  // Colors:
  if(cur_pre == "current") {
    var border_color = 'rgba(35, 35, 35, 1)';
    var background_color = 'rgba(69, 156, 178, 1)';
    var front_color = 'rgba(176, 239, 255,1)';
  } else {
    var border_color = 'rgba(176, 239, 255,1)';
    var background_color = 'rgba(69, 156, 178, 1)';
    var front_color = 'rgba(35, 35, 35, 1)';

    // destroy previous graphs:
    if (document.getElementById("predicted-temp-graph").style.display == "block") {
      background_canvas_temp.destroy();
      canvas_temp.destroy();
      background_precipitation_number_canvas.destroy();
      precipitation_number_canvas.destroy();
    }
  }

  // current temperatur graph
  var temp_graph = document.getElementById(cur_pre + "-temp-graph");
  var background = {
    type: 'doughnut',
    data: {
        datasets: [{
            data: [10],
            backgroundColor: [
              background_color,
            ],
            borderColor: [
              border_color,
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
  background_canvas_temp = new Chart(temp_graph, background);
  // current temperatur on graph
  // calculate position of currrent temp - if temp = min/max it still shows a little space
  var step_lower = Math.max(10, Math.round((tmp-min)/(max-min)*100));
  var step_upper = Math.max(10, 100-step_lower);
  // display it
  var temp_graph_number = document.getElementById(cur_pre + "-temp-graph-number");
  canvas_temp = new Chart(temp_graph_number, {
    type: 'doughnut',
    data: {
        datasets: [{
            data: [step_lower,2,step_upper],
            backgroundColor: [
              'rgba(0,0,0,0)',
              front_color,
                'rgba(0,0,0,0)',
            ],
            borderColor: [
            'rgba(0, 0, 0 ,0)',
            front_color,
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
  var precipitation_number = document.getElementById(cur_pre + "-precipitation-graph");
  background_precipitation_number_canvas = new Chart(precipitation_number, background);
  
  // current value on graph
  // calculate position of currrent temp - if temp = min/max it still shows a little space
  var step_lower = precipitation_probability;
  var step_upper = 100-step_lower;
  // display it
  var precipitation_number = document.getElementById(cur_pre + "-precipitation-graph-number");
  precipitation_number_canvas = new Chart(precipitation_number, {
    type: 'doughnut',
    data: {
        datasets: [{
            data: [step_lower,step_upper],
            backgroundColor: [
              front_color,
              "rgba(0,0,0,0)",
            ],
            borderColor: [
              front_color,
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

  temperatur_graph(weatherData.current_temp, weatherData.min_temp, weatherData.max_temp, weatherData.precipitation_probability, "current");
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
  document.getElementById("predicted-weather-box").style.display = "block";
  predictedWeather.style.display = "block";
  // Generate predicted weather HTML
  var predictedWeather_text = 
    '<img id="predicted-weather-icon" src="/static/weather_icons_dark/' + weatherData.icon_number + '.svg" alt="Predicted weather icon">';
  var current_temp_graph = document.getElementById("predicted-precipitation-graph");
  predictedWeather.innerHTML = predictedWeather_text;

  document.getElementById("predicted-temp").innerHTML = weatherData.forecast_temp + '°C';
  document.getElementById("predicted-min").innerHTML = weatherData.min_temp;
  document.getElementById("predicted-max").innerHTML = weatherData.max_temp;
  document.getElementById("predicted-precipitation-probability").innerHTML = weatherData.precipitation_probability + '%';

  temperatur_graph(weatherData.forecast_temp, weatherData.min_temp, weatherData.max_temp, weatherData.precipitation_probability, "predicted");
}


export { showLiveWeather, showPredictedWeather };