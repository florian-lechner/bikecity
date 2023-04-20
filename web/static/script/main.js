import { drawMap } from "./map.js";
import { searchBoxes } from "./search.js";
import { formSubmission } from "./formSubmission.js";
import { showLiveWeather } from "./weather.js";
import { createSlider } from "./timeline.js";

function main()  {
    drawMap();
    searchBoxes();
    formSubmission();
    showLiveWeather();
    createSlider();
}

window.initMap = main;


