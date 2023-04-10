import { drawMap } from "./map.js";
import { searchBoxes, checkRouteStatus } from "./search.js";
import { formSubmission } from "./formSubmission.js";
import { showLiveWeather } from "./weather.js";
import { requestRouteDrawPolyline, showCompleteRoute, showPartialRoute } from "./route.js";
import { context, routeParams, updateWalkOrigin, updateWalkDistDur1, updateStartBike, updateBikeDistDur, updateStopBike, updateWalkDistDur2, updateWalkDestination, updateTotalValues } from "./context.js";

function main()  {
    drawMap();
    searchBoxes();
    formSubmission();
    showLiveWeather();
    //requestRouteDrawPolyline(routeParams.originLoc, routeParams.destinationLoc, 'BICYCLING');
}

window.initMap = main;


