let context = {
    map: undefined,
    openChartWindow: undefined,
    openInfoWindow: undefined,
    markers: [],         
    applicationTime: new Date(Date.now()),
    forecast_hour: 0
  };

// window.context = context;

let routeParams = {  // zero as default state
  originLoc: { Lat : 0, Long :	0 },
  startBikeLoc: { Lat : 0, Long :	0 },
  stopBikeLoc: { Lat : 0, Long :	0 },
  destinationLoc: { Lat : 0, Long :	0 },
      
  walkDistDur1: { Dist : 0, Dur: 0 },
  bikeDistDur: { Dist : 0, Dur: 0 },
  walkDistDur2: { Dist : 0, Dur: 0 },
  totalValues: { Dist: 0, Dur: 0 },

  routePolylines: undefined,
}

// window.routeParams = routeParams;


// setters for updating locations and distance/duration values
function updateWalkOrigin(origin) {
  routeParams.originLoc = origin;
}

function updateWalkDistDur1(walkTime) {
  routeParams.walkDistDur1 = walkTime;
}

function updateStartBike(startBike) {
  routeParams.startBikeLoc = startBike;
}

function updateBikeDistDur(bikeTime) {
  routeParams.bikeDistDur = bikeTime;
}

function updateStopBike(stopBike) {
  routeParams.stopBikeLoc = stopBike;
}

function updateWalkDistDur2(walkTime) {
  routeParams.walkDistDur2 = walkTime;
}

function updateWalkDestination(destination) {
  routeParams.destinationLoc = destination;
}

function updateTotalValues(totals) {
  routeParams.totalValues = totals;
}

 
export { context, routeParams, updateWalkOrigin, updateWalkDistDur1, updateStartBike, updateBikeDistDur, updateStopBike, updateWalkDistDur2, updateWalkDestination, updateTotalValues };