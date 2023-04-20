let context = {
    map: undefined,
    openChartWindow: undefined,
    openInfoWindow: undefined,
    openInfoWindowStation: undefined,
    markers: [],
    markerDisplayMode: 'bikes',
    startMarker: undefined,
    endMarker: undefined,
    applicationTime: new Date(Date.now()),
    clusterer: undefined, 
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

function storeTimelineData(timelineData){
  context.timeline_data = timelineData;
}

function clearRouteDistDurParams(){
  routeParams.walkDistDur1 =  {Dist: 0, Dur: 0};
  routeParams.bikeDistDur = {Dist: 0, Dur: 0}
  routeParams.walkDistDur2 =  {Dist: 0, Dur: 0};
}

function calcTotalDistDurParams(){
  routeParams.totalValues =  {
    Dist: (parseInt(routeParams.walkDistDur1.Dist) + parseInt(routeParams.bikeDistDur.Dist) + parseInt(routeParams.walkDistDur2.Dist)),
    Dur: (parseInt(routeParams.walkDistDur1.Dur) + parseInt(routeParams.bikeDistDur.Dur) + parseInt(routeParams.walkDistDur2.Dur)),
  }
}

 
export { context, routeParams, updateWalkOrigin, updateWalkDistDur1, updateStartBike, updateBikeDistDur, updateStopBike, updateWalkDistDur2, updateWalkDestination, clearRouteDistDurParams, calcTotalDistDurParams, storeTimelineData };