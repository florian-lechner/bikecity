import { drawMap } from "./map.js";
import { searchBoxes } from "./search.js";
import { formSubmission } from "./formSubmission.js";
import { showLiveWeather } from "./weather.js";
import { requestRoute } from "./route.js";
import { context, routeParams } from "./context.js";

function main()  {
    drawMap();
    searchBoxes();
    formSubmission();
    showLiveWeather();
    requestRouteDrawPolyline(routeParams.origin, routeParams.destination, 'BICYCLING');
}

window.initMap = main;


