import { drawMap } from "./map.js";
import { searchBoxes } from "./search.js";
import { formSubmission } from "./formSubmission.js";
import { showLiveWeather } from "./weather.js";

function main()  {
    drawMap();
    searchBoxes();
    formSubmission();
    showLiveWeather();
}

console.log("test")

window.initMap = main;
