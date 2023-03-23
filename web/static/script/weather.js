import { context } from "./context.js";

// Globally available variables
let currentTemp;
let sunriseTime;
let sunsetTime;
let temperatureFeelsLike;
let currentWeatherType;

function showLiveWeather() {
    fetch("/getLiveWeather")
      .then((response) => response.json())
      .then((weatherData) => {
        // save data into variables
        currentTemp = weatherData.current_temp;
        sunriseTime = weatherData.sunrise_time;
        sunsetTime = weatherData.sunset_time;
        temperatureFeelsLike = weatherData.temperature_feels_like;
        currentWeatherType = weatherData.weather_type;
      })
      .then(() => liveWeather()); // call LiveWeather() after data is retrieved
}

function liveWeather() {
    // Create the search box and link it to the UI element.
    var liveWeather = document.getElementById("current-weather");

    //showLiveWeather();

    var liveWeather_text = 
    '<div id="current-weather-text">' +
    '<p> Current Weather <p>' +                 // weather icon not working yet
    '<p><img id="current-weather-icon" src="web/static/weather_icons/04.png" alt="Current weather icon"><p>' +
    '<p>  ' + currentTemp + '°C, Feels like '+ temperatureFeelsLike +'<p>' + '</div>';

    liveWeather.innerHTML = liveWeather_text;
  }

// function ForecastWeather() {
//    var predictedWeather_box = document.getElementById("predicted-weather");
//    var predictedWeather_text;
// }

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
  iconPath = `web/static/weather_icons/${iconName}.png`;
  return iconPath;
}


export {showLiveWeather};