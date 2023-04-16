let context = {
    map: undefined,
    openChartWindow: undefined,
    openInfoWindow: undefined,
    markers: [],
    markerDisplayMode: 'bikes',
    startMarker: undefined,
    endMarker: undefined,
    applicationTime: new Date(Date.now()),
    forecast_hour: 0,
    
    timeline_data: undefined,
    timeline_is_animating: false,
    timeline_time: undefined,
    timeline_start_value: undefined,
  };

let routeParams = {  // zero as default state
  originLoc: { Lat : 0, Long :	0 },
  startBikeLoc: { Lat : 0, Long :	0 },
  startBikeStation: undefined,
  stopBikeLoc: { Lat : 0, Long :	0 },
  stopBikeStation: undefined,
  destinationLoc: { Lat : 0, Long :	0 },
      
  walkDistDur1: { Dist : 0, Dur: 0 },
  bikeDistDur: { Dist : 0, Dur: 0 },
  walkDistDur2: { Dist : 0, Dur: 0 },
  totalValues: { Dist: 0, Dur: 0 },

  routePolylines: undefined,
}

// setters for updating locations and distance/duration values
function updateWalkOrigin(origin) {
  routeParams.originLoc = origin;
}

function updateWalkDistDur1(walkTime) {
  routeParams.walkDistDur1 = walkTime;
}

function updateStartBike(startBike, station) {
  routeParams.startBikeLoc = startBike;
  routeParams.startBikeStation = station;
}

function updateBikeDistDur(bikeTime) {
  routeParams.bikeDistDur = bikeTime;
}

function updateStopBike(stopBike, station) {
  routeParams.stopBikeLoc = stopBike;
  routeParams.stopBikeStation = station;
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

function storeTimelineData(timelineData){
  context.timeline_data = timelineData;
}

 
export { context, routeParams, updateWalkOrigin, updateWalkDistDur1, updateStartBike, updateBikeDistDur, updateStopBike, updateWalkDistDur2, updateWalkDestination, updateTotalValues, storeTimelineData };