import { context, routeParams, updateWalkOrigin, updateWalkDistDur1, updateStartBike, updateBikeDistDur, updateStopBike, updateWalkDistDur2, updateWalkDestination, updateTotalValues } from "./context.js";
import { findDistances, populateDiv, preselectStation } from "./distance.js";
import { requestRouteDrawPolyline, showCompleteRoute, showPartialRoute } from "./route.js";

// Preselects
var preselectStartBike, preselectEndBike;


// function that calls findDistances and populates tables
function place_changed(places, start) {
  let LocationLat, LocationLng;

  places.forEach((place) => {
    LocationLat = place.geometry.location.lat();
    LocationLng = place.geometry.location.lng();
  });
  
  if (start) {
    // Update the walk origin
    updateWalkOrigin({ Lat: LocationLat, Long: LocationLng });
    // find distances to bike station and create popup
    return findDistances(LocationLat, LocationLng, (closestStations) => {
      // preselect func, availabilityKey 'bikes'
      preselectStartBike = preselectStation(closestStations, 'bikes', 'start');
      populateDiv(closestStations, 'start', preselectStartBike, preselectEndBike);
      document.getElementById('start-bike-show-more').addEventListener('click', function() {
        document.getElementsByClassName('start-locations-popup-more-info')[0].style.visibility = "visible";
        document.getElementsByClassName("popup-more-info")[0].style.visibility = "visible";
      });
    });
    
  } else {
    // Update the walk destination
    updateWalkDestination({ Lat: LocationLat, Long: LocationLng });
    // find distances to bike station and create popup
    return findDistances(LocationLat, LocationLng, (closestStations) => {
      // preselect func, availabilityKey 'bike_stands'
      preselectEndBike = preselectStation(closestStations, 'bike_stands', 'stop');
      populateDiv(closestStations, 'stop', preselectStartBike, preselectEndBike);
      document.getElementById('stop-bike-show-more').addEventListener('click', function() {
        document.getElementsByClassName('stop-locations-popup-more-info')[0].style.visibility = "visible";
        document.getElementsByClassName("popup-more-info")[0].style.visibility = "visible";
      });
    });
  }
}

// Input fields connection with GoogleAPI
function searchBoxes() {
    // Create the search box and link it to the UI element.
    const input_start = document.getElementById("start-location-field");
    const searchBox_start = new google.maps.places.SearchBox(input_start);
  
    const input_end = document.getElementById("end-location-field");
    const searchBox_end = new google.maps.places.SearchBox(input_end);
  
    // Bias the SearchBox results towards current map's viewport.
    context.map.addListener("bounds_changed", () => {
      searchBox_start.setBounds(context.map.getBounds());
      searchBox_end.setBounds(context.map.getBounds());
    });
  
    searchBox_start.addListener("places_changed", () => {
      place_changed(searchBox_start.getPlaces(), true)
      .then(result => checkRouteStatus()); 
    });
  
    searchBox_end.addListener("places_changed", () => {
      place_changed(searchBox_end.getPlaces(), false)
      .then(result => checkRouteStatus()); 
    });
  }

// function that checks which parameters the current selection is fulfilling
function checkRouteStatus() {
    if (routeParams.originLoc.Lat != 0 && routeParams.destinationLoc.Lat != 0) {
      console.log("Both origin and destination set: ", routeParams);
      showCompleteRoute();
    } else if (routeParams.originLoc.Lat != 0 && routeParams.destinationLoc.Lat == 0) {
      console.log("Only origin set: ", routeParams);
      showPartialRoute();
    }
  }

export { searchBoxes, checkRouteStatus };