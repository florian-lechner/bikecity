import { context } from "./context.js";
import { findDistances, populateDiv, preselectStation } from "./distance.js";

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
    findDistances(LocationLat, LocationLng, (closestStations) => {
      // preselect func, availabilityKey 'bikes'
      preselectStartBike = preselectStation(closestStations, 'bikes', 'start');
      populateDiv(closestStations, 'start', preselectStartBike, preselectEndBike);
      document.getElementById('start-bike-show-more').addEventListener('click', function() {
        document.getElementsByClassName('start-locations-popup-more-info')[0].style.visibility = "visible";
        document.getElementsByClassName("popup-more-info")[0].style.visibility = "visible";
      });
    });
  } else {
    findDistances(LocationLat, LocationLng, (closestStations) => {
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
      place_changed(searchBox_start.getPlaces(), true);

    });
  
    searchBox_end.addListener("places_changed", () => {
      place_changed(searchBox_end.getPlaces(), false);
    });
  }

export { searchBoxes };