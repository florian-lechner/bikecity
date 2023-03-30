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
    '<p><img id="current-weather-icon" src="/static/weather_icons/04.png" alt="Current weather icon"><p>' +
    '<p>  ' + weatherData.current_temp + '°C, Feels like '+ weatherData.temperature_feels_like +'°C<p>' + '</div>';
  
  // Insert the live weather html
  liveWeather.innerHTML = liveWeather_text;
}

function showPredictedWeather(selectedTime) {
  console.log(selectedTime);
  fetch("/getForecastWeather/" + selectedTime)
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
    '<p> Predicted Weather <p>' +                 // weather icon not working yet
    '<p><img id="predicted-weather-icon" src="/static/weather_icons/04.png" alt="Predicted weather icon"><p>' +
    '<p>  ' + weatherData.currentTemp + '°C';
  
  // Insert the predicted weather html
  predictedWeather.innerHTML = predictedWeather_text;
}


function IconSelector(currentWeatherType) {
  const sunrise = new Date(sunriseTime);
  const sunset = new Date(sunsetTime);
  const currentTime = new Date();
  const isDay = currentTime >= sunrise && currentTime < sunset;
  const weatherIcons = {
      'Sun': '01d',
      'LightCloud': '02d',
      'PartlyCloud': '03d',
      'Cloud': '04',
      'LightRainSun': '40d',
      'RainSun': '05d',
      'HeavyRainSun': '41d',
      'LightRainThunderSun': '06d',
      'LightSleetSun': '07d',
      'SleetSun': '07d',
      'SnowSun': '08d',
      'Drizzle': '46',
      'LightRain': '09',
      'Rain': '10',
      'RainThunder': '11',
      'Sleet': '12',
      'Snow': '13',
      'SnowThunder': '14',
      'Fog': '15',
      'SleetSunThunder': '20d',
      'SnowSunThunder': '21d',
      'LightRainThunder': '24d',
      'LightSleetThunderSun': '26d',
      'RainThunderSun': '25d',
      'DrizzleThunderSun': '24d',
      'HeavySleetThunderSun': '27d',
      'SleetThunder': '23d',
      'LightSnowThunderSun': '28d',
      'HeavySnowThunderSun': '29d',
      'DrizzleThunder': '30',
      'LightSleetThunder': '31',
      'HeavySleetThunder': '32',
      'LightSnowThunder': '33',
      'HeavySnowThunder': '34',
      'LightSleet': '42d',
      'HeavySleetSun': '43d',
      'LightSnowSun': '44d',
      'HeavySnowSun': '45d',
      'DrizzleSun': '40d',
      'LightHail': '51d',
      'HeavyHail': '52d',
  };
  let iconPath = `web/static/weather_icons/04.png`; // Default to Cloud icon
  let iconName;
  if (currentWeatherType.startsWith('Dark_')) {
    iconName = currentWeatherType.substr(5);
    if (weatherIcons.hasOwnProperty(iconName)) {
      const iconValue = weatherIcons[iconName];
      if (iconValue.includes('d')) {
        iconName = `${iconValue.slice(0, -1)}n`;
      } else {
        iconName = iconValue;
      }
    } else {
      iconName = '04'; // Default to Cloud icon
    }
  } else {
    iconName = weatherIcons.hasOwnProperty(currentWeatherType) ? weatherIcons[currentWeatherType] : '04';
  }
  iconPath = `/static/weather_icons/${iconName}.png`;
  return iconPath;
}


export { showLiveWeather, showPredictedWeather };